import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { generateRequestId, maskAmount, maskPaymentId, logError, logInfo } from '../_shared/logging.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const requestId = req.headers.get('x-request-id') || generateRequestId();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, 'x-request-id': requestId } });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logError("Configuration error - missing signature or secret", undefined, requestId);
    return new Response(JSON.stringify({ error: "Webhook configuration error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json", 'x-request-id': requestId },
    });
  }

  try {
    logInfo('Webhook received', { event: 'processing' }, requestId);
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get raw body for signature verification
    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logInfo("Event verified", { event_type: event.type }, requestId);
    } catch (err) {
      logError("Signature verification failed", err, requestId);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json", 'x-request-id': requestId },
      });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logInfo("Checkout completed", { session_id: maskPaymentId(session.id) }, requestId);

        const purchaseId = session.metadata?.purchase_id;
        const paymentType = session.metadata?.payment_type;

        if (!purchaseId) {
          logError("Missing metadata", undefined, requestId);
          break;
        }

        // Update purchase with payment intent ID
        const { data: purchase, error: fetchError } = await supabaseClient
          .from("purchases")
          .select("*")
          .eq("id", purchaseId)
          .single();

        if (fetchError || !purchase) {
          logError("Purchase not found", fetchError, requestId);
          break;
        }

        const amountPaid = session.amount_total || 0;
        const isFullPayment = paymentType === "full";
        const newAmountPaid = (purchase.amount_paid_cents || 0) + amountPaid;
        const isFullyPaid = newAmountPaid >= purchase.total_amount_cents;

        // Update purchase record
        const { error: updateError } = await supabaseClient
          .from("purchases")
          .update({
            stripe_payment_intent_id: session.payment_intent as string,
            amount_paid_cents: newAmountPaid,
            status: isFullyPaid ? "completed" : "partial",
            purchased_at: new Date().toISOString(),
          })
          .eq("id", purchaseId);

        if (updateError) {
          logError("Purchase update failed", updateError, requestId);
          break;
        }

        logInfo("Purchase updated", { status: isFullyPaid ? "completed" : "partial" }, requestId);

        // Grant package access if fully paid
        if (isFullyPaid) {
          const { error: accessError } = await supabaseClient
            .from("package_access")
            .insert({
              user_id: purchase.user_id,
              package_id: purchase.package_id,
              purchase_id: purchase.id,
              access_granted_at: new Date().toISOString(),
              access_expires_at: purchase.membership_end_date,
              is_active: true,
            });

          if (accessError) {
            logError("Access grant failed", accessError, requestId);
          } else {
            logInfo("Access granted", {}, requestId);
          }
        }

        // Send payment confirmation email
        try {
          await supabaseClient.functions.invoke("send-payment-confirmation", {
            body: {
              purchaseId,
              userId: purchase.user_id,
              amountPaid,
              isFullPayment: isFullyPaid,
              requestId, // Pass request ID to child function
            },
          });
          logInfo("Confirmation email queued", {}, requestId);
        } catch (emailError) {
          logError("Email send failed", emailError, requestId);
          // Don't fail the webhook if email fails
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logInfo("Payment succeeded", { payment_intent_id: maskPaymentId(paymentIntent.id) }, requestId);

        // Find purchase by payment_intent_id
        const { data: purchases } = await supabaseClient
          .from("purchases")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (purchases && purchases.length > 0) {
          const purchase = purchases[0];
          logInfo("Found purchase for payment intent", { purchaseId: purchase.id }, requestId);

          // Check if this is an installment payment
          const { data: installment } = await supabaseClient
            .from("payment_plan_installments")
            .select("*")
            .eq("purchase_id", purchase.id)
            .eq("status", "pending")
            .order("installment_number", { ascending: true })
            .limit(1)
            .single();

          if (installment) {
            // Update installment as paid
            const { error: installmentError } = await supabaseClient
              .from("payment_plan_installments")
              .update({
                stripe_payment_intent_id: paymentIntent.id,
                status: "paid",
                paid_at: new Date().toISOString(),
              })
              .eq("id", installment.id);

            if (installmentError) {
              logError("Failed to update installment", installmentError, requestId);
            } else {
              logInfo("Installment marked as paid", { installmentNumber: installment.installment_number }, requestId);

              // Update purchase amount_paid_cents
              const newAmountPaid = (purchase.amount_paid_cents || 0) + installment.amount_cents;
              const isFullyPaid = newAmountPaid >= purchase.total_amount_cents;

              const { error: updateError } = await supabaseClient
                .from("purchases")
                .update({
                  amount_paid_cents: newAmountPaid,
                  status: isFullyPaid ? "completed" : "partial",
                })
                .eq("id", purchase.id);

              if (updateError) {
                logError("Failed to update purchase amount", updateError, requestId);
              }

              // If fully paid, ensure package access
              if (isFullyPaid) {
                const { error: accessError } = await supabaseClient
                  .from("package_access")
                  .upsert({
                    user_id: purchase.user_id,
                    package_id: purchase.package_id,
                    purchase_id: purchase.id,
                    access_granted_at: new Date().toISOString(),
                    access_expires_at: purchase.membership_end_date,
                    is_active: true,
                  });

                if (!accessError) {
                  logInfo("Package access granted after full payment", {}, requestId);
                }
              }

              // Send payment confirmation email for installment
              try {
                await supabaseClient.functions.invoke("send-payment-confirmation", {
                  body: {
                    purchaseId: purchase.id,
                    userId: purchase.user_id,
                    amountPaid: installment.amount_cents,
                    isFullPayment: isFullyPaid,
                  },
                });
                console.log("[stripe-webhook] Installment confirmation email sent");
              } catch (emailError) {
                console.error("[stripe-webhook] Failed to send installment email:", emailError);
              }
            }
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logInfo("Payment intent failed", { payment_intent_id: maskPaymentId(paymentIntent.id) }, requestId);

        // Find related purchase or installment
        const { data: purchases } = await supabaseClient
          .from("purchases")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (purchases && purchases.length > 0) {
          const purchase = purchases[0];
          logInfo("Payment failed for purchase", { purchaseId: purchase.id }, requestId);

          // Mark purchase as failed if it was pending
          if (purchase.status === "pending") {
            const { error: updateError } = await supabaseClient
              .from("purchases")
              .update({ status: "failed" })
              .eq("id", purchase.id);

            if (updateError) {
              logError("Failed to update purchase status", updateError, requestId);
            }
          }

          // Check for failed installment payment
          const { data: installment } = await supabaseClient
            .from("payment_plan_installments")
            .select("*")
            .eq("stripe_payment_intent_id", paymentIntent.id)
            .single();

          if (installment) {
            const { error: installmentError } = await supabaseClient
              .from("payment_plan_installments")
              .update({ status: "failed" })
              .eq("id", installment.id);

            if (installmentError) {
              logError("Failed to update installment status", installmentError, requestId);
            } else {
              logInfo("Installment marked as failed", { installmentNumber: installment.installment_number }, requestId);
            }
          }
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        logInfo("Charge refunded", { charge_id: maskPaymentId(charge.id) }, requestId);

        // Find purchase by payment_intent_id
        if (charge.payment_intent) {
          const { data: purchases } = await supabaseClient
            .from("purchases")
            .select("*")
            .eq("stripe_payment_intent_id", charge.payment_intent as string);

          if (purchases && purchases.length > 0) {
            const purchase = purchases[0];
            const refundAmount = charge.amount_refunded || 0;

            // Update purchase
            const { error: updateError } = await supabaseClient
              .from("purchases")
              .update({
                amount_paid_cents: Math.max(0, (purchase.amount_paid_cents || 0) - refundAmount),
                status: "refunded",
              })
              .eq("id", purchase.id);

            if (updateError) {
              logError("Failed to update refunded purchase", updateError, requestId);
            } else {
              logInfo("Purchase marked as refunded", { purchaseId: purchase.id }, requestId);

              // Deactivate package access
              const { error: accessError } = await supabaseClient
                .from("package_access")
                .update({ is_active: false })
                .eq("purchase_id", purchase.id);

              if (accessError) {
                logError("Failed to deactivate package access", accessError, requestId);
              } else {
                logInfo("Package access deactivated", {}, requestId);
              }
            }
          }
        }

        break;
      }

      default:
        logInfo("Unhandled event type", { eventType: event.type }, requestId);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", 'x-request-id': requestId },
    });
  } catch (error) {
    logError('Webhook processing error', error, requestId);
    return new Response(JSON.stringify({ error: 'An error occurred processing webhook. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json", 'x-request-id': requestId },
    });
  }
});
