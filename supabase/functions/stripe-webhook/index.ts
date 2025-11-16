import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("[stripe-webhook] Missing signature or webhook secret");
    return new Response(JSON.stringify({ error: "Webhook configuration error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
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
      console.log("[stripe-webhook] Event verified:", event.type);
    } catch (err) {
      console.error("[stripe-webhook] Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[stripe-webhook] Checkout session completed:", session.id);

        const purchaseId = session.metadata?.purchase_id;
        const paymentType = session.metadata?.payment_type;

        if (!purchaseId) {
          console.error("[stripe-webhook] No purchase_id in session metadata");
          break;
        }

        // Update purchase with payment intent ID
        const { data: purchase, error: fetchError } = await supabaseClient
          .from("purchases")
          .select("*")
          .eq("id", purchaseId)
          .single();

        if (fetchError || !purchase) {
          console.error("[stripe-webhook] Purchase not found:", purchaseId);
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
          console.error("[stripe-webhook] Failed to update purchase:", updateError);
          break;
        }

        console.log("[stripe-webhook] Purchase updated:", {
          purchaseId,
          amountPaid: newAmountPaid,
          status: isFullyPaid ? "completed" : "partial",
        });

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
            console.error("[stripe-webhook] Failed to grant package access:", accessError);
          } else {
            console.log("[stripe-webhook] Package access granted for:", purchaseId);
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
            },
          });
          console.log("[stripe-webhook] Payment confirmation email sent");
        } catch (emailError) {
          console.error("[stripe-webhook] Failed to send confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("[stripe-webhook] Payment intent succeeded:", paymentIntent.id);

        // Find purchase by payment_intent_id
        const { data: purchases } = await supabaseClient
          .from("purchases")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (purchases && purchases.length > 0) {
          const purchase = purchases[0];
          console.log("[stripe-webhook] Found purchase for payment intent:", purchase.id);

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
              console.error("[stripe-webhook] Failed to update installment:", installmentError);
            } else {
              console.log("[stripe-webhook] Installment marked as paid:", installment.installment_number);

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
                console.error("[stripe-webhook] Failed to update purchase amount:", updateError);
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
                  console.log("[stripe-webhook] Package access granted after full payment");
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
        console.log("[stripe-webhook] Payment intent failed:", paymentIntent.id);

        // Find related purchase or installment
        const { data: purchases } = await supabaseClient
          .from("purchases")
          .select("*")
          .eq("stripe_payment_intent_id", paymentIntent.id);

        if (purchases && purchases.length > 0) {
          const purchase = purchases[0];
          console.log("[stripe-webhook] Payment failed for purchase:", purchase.id);

          // Mark purchase as failed if it was pending
          if (purchase.status === "pending") {
            const { error: updateError } = await supabaseClient
              .from("purchases")
              .update({ status: "failed" })
              .eq("id", purchase.id);

            if (updateError) {
              console.error("[stripe-webhook] Failed to update purchase status:", updateError);
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
              console.error("[stripe-webhook] Failed to update installment status:", installmentError);
            } else {
              console.log("[stripe-webhook] Installment marked as failed:", installment.installment_number);
            }
          }
        }

        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("[stripe-webhook] Charge refunded:", charge.id);

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
              console.error("[stripe-webhook] Failed to update refunded purchase:", updateError);
            } else {
              console.log("[stripe-webhook] Purchase marked as refunded:", purchase.id);

              // Deactivate package access
              const { error: accessError } = await supabaseClient
                .from("package_access")
                .update({ is_active: false })
                .eq("purchase_id", purchase.id);

              if (accessError) {
                console.error("[stripe-webhook] Failed to deactivate package access:", accessError);
              } else {
                console.log("[stripe-webhook] Package access deactivated");
              }
            }
          }
        }

        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[stripe-webhook] Error processing webhook:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
