import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logStep("Webhook signature verification failed", { error: errorMessage });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", {
          sessionId: session.id,
          metadata: session.metadata,
        });

        const purchaseId = session.metadata?.purchase_id;
        const purchaseType = session.metadata?.purchase_type;

        if (!purchaseId) {
          logStep("No purchase_id in metadata");
          break;
        }

        // Update purchase record
        const updateData: any = {
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          purchased_at: new Date().toISOString(),
        };

        if (purchaseType === "full") {
          updateData.amount_paid_cents = session.amount_total;
        } else if (purchaseType === "payment_plan") {
          // For payment plans, this is just the down payment
          const { data: purchase } = await supabaseClient
            .from("purchases")
            .select("total_amount_cents")
            .eq("id", purchaseId)
            .single();

          if (purchase) {
            updateData.amount_paid_cents = session.amount_total;
          }
        }

        const { error: updateError } = await supabaseClient
          .from("purchases")
          .update(updateData)
          .eq("id", purchaseId);

        if (updateError) {
          logStep("Error updating purchase", { error: updateError });
          throw updateError;
        }
        logStep("Purchase updated successfully", { purchaseId });

        // Get purchase details to create package access
        const { data: purchase } = await supabaseClient
          .from("purchases")
          .select("user_id, package_id, membership_end_date")
          .eq("id", purchaseId)
          .single();

        if (purchase) {
          // Create or update package access
          const { error: accessError } = await supabaseClient
            .from("package_access")
            .upsert({
              user_id: purchase.user_id,
              package_id: purchase.package_id,
              purchase_id: purchaseId,
              access_granted_at: new Date().toISOString(),
              access_expires_at: purchase.membership_end_date,
              is_active: true,
            });

          if (accessError) {
            logStep("Error creating package access", { error: accessError });
          } else {
            logStep("Package access granted", {
              userId: purchase.user_id,
              packageId: purchase.package_id,
            });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent succeeded", { paymentIntentId: paymentIntent.id });

        // Check if this is an installment payment
        const installmentId = paymentIntent.metadata?.installment_id;
        if (installmentId) {
          const { error: installmentError } = await supabaseClient
            .from("payment_plan_installments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: paymentIntent.id,
            })
            .eq("id", installmentId);

          if (installmentError) {
            logStep("Error updating installment", { error: installmentError });
          } else {
            logStep("Installment marked as paid", { installmentId });

            // Update total amount paid in purchase
            const { data: installment } = await supabaseClient
              .from("payment_plan_installments")
              .select("purchase_id, amount_cents")
              .eq("id", installmentId)
              .single();

            if (installment) {
              const { data: purchase } = await supabaseClient
                .from("purchases")
                .select("amount_paid_cents")
                .eq("id", installment.purchase_id)
                .single();

              if (purchase) {
                const newAmountPaid = (purchase.amount_paid_cents || 0) + installment.amount_cents;
                
                await supabaseClient
                  .from("purchases")
                  .update({ amount_paid_cents: newAmountPaid })
                  .eq("id", installment.purchase_id);

                logStep("Purchase amount updated", {
                  purchaseId: installment.purchase_id,
                  newAmountPaid,
                });
              }
            }
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment intent failed", { paymentIntentId: paymentIntent.id });

        const installmentId = paymentIntent.metadata?.installment_id;
        if (installmentId) {
          await supabaseClient
            .from("payment_plan_installments")
            .update({ status: "failed" })
            .eq("id", installmentId);
          
          logStep("Installment marked as failed", { installmentId });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        logStep("Charge refunded", { chargeId: charge.id });

        // Find purchase by payment intent
        const { data: purchase } = await supabaseClient
          .from("purchases")
          .select("id, user_id, package_id")
          .eq("stripe_payment_intent_id", charge.payment_intent as string)
          .single();

        if (purchase) {
          // Update purchase status
          await supabaseClient
            .from("purchases")
            .update({ status: "refunded" })
            .eq("id", purchase.id);

          // Deactivate package access
          await supabaseClient
            .from("package_access")
            .update({ is_active: false })
            .eq("purchase_id", purchase.id);

          logStep("Purchase refunded and access revoked", {
            purchaseId: purchase.id,
          });
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session expired", { sessionId: session.id });

        const purchaseId = session.metadata?.purchase_id;
        if (purchaseId) {
          await supabaseClient
            .from("purchases")
            .update({ status: "expired" })
            .eq("id", purchaseId);

          logStep("Purchase marked as expired", { purchaseId });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
