import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  package_id: string;
  payment_type: "full_payment" | "payment_plan";
}

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
    console.log("[create-checkout] Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    console.log("[create-checkout] User authenticated:", user.id);

    // Parse request body
    const body: CheckoutRequest = await req.json();
    const { package_id, payment_type = "full_payment" } = body;

    if (!package_id) {
      throw new Error("package_id is required");
    }

    console.log("[create-checkout] Request:", { package_id, payment_type });

    // Fetch package details
    const { data: packageData, error: packageError } = await supabaseClient
      .from("packages")
      .select("*")
      .eq("id", package_id)
      .eq("is_active", true)
      .single();

    if (packageError || !packageData) {
      throw new Error("Package not found or inactive");
    }

    // Validate payment plan request
    if (payment_type === "payment_plan" && !packageData.has_payment_plan) {
      throw new Error("This package does not support payment plans");
    }

    console.log("[create-checkout] Package found:", packageData.name);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[create-checkout] Existing customer found:", customerId);
    }

    // Calculate amounts
    const totalAmount = packageData.base_price_cents;
    let initialPayment = totalAmount;
    
    if (payment_type === "payment_plan" && packageData.payment_plan_config) {
      const config = packageData.payment_plan_config as any;
      initialPayment = config.down_payment_cents || Math.floor(totalAmount * 0.25);
    }

    // Create purchase record
    const membershipStartDate = new Date().toISOString().split('T')[0];
    const membershipEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const refundEligibleUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("purchases")
      .insert({
        user_id: user.id,
        package_id: package_id,
        purchase_type: payment_type,
        total_amount_cents: totalAmount,
        amount_paid_cents: 0,
        status: "pending",
        membership_start_date: membershipStartDate,
        membership_end_date: membershipEndDate,
        refund_eligible_until: refundEligibleUntil,
        metadata: {
          payment_type,
          package_name: packageData.name,
        },
      })
      .select()
      .single();

    if (purchaseError || !purchase) {
      throw new Error(`Failed to create purchase: ${purchaseError?.message}`);
    }

    console.log("[create-checkout] Purchase created:", purchase.id);

    // If payment plan, create installments
    if (payment_type === "payment_plan" && packageData.payment_plan_config) {
      const config = packageData.payment_plan_config as any;
      const remainingAmount = totalAmount - initialPayment;
      const numInstallments = config.installments || 3;
      const installmentAmount = Math.floor(remainingAmount / numInstallments);
      
      const installments = [];
      for (let i = 0; i < numInstallments; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        
        installments.push({
          purchase_id: purchase.id,
          installment_number: i + 1,
          amount_cents: i === numInstallments - 1 
            ? remainingAmount - (installmentAmount * (numInstallments - 1)) // Last installment gets remainder
            : installmentAmount,
          due_date: dueDate.toISOString().split('T')[0],
          status: "pending",
        });
      }

      const { error: installmentsError } = await supabaseClient
        .from("payment_plan_installments")
        .insert(installments);

      if (installmentsError) {
        console.error("[create-checkout] Failed to create installments:", installmentsError);
        // Don't fail the entire transaction, just log
      } else {
        console.log("[create-checkout] Created", installments.length, "installments");
      }
    }

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || "http://localhost:8080";
    
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: initialPayment,
            product_data: {
              name: payment_type === "payment_plan" 
                ? `${packageData.name} - Down Payment`
                : packageData.name,
              description: payment_type === "payment_plan"
                ? `Initial payment for ${packageData.name}`
                : packageData.description,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        purchase_id: purchase.id,
        package_id: package_id,
        user_id: user.id,
        payment_type: payment_type,
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("[create-checkout] Checkout session created:", session.id);

    // Update purchase with checkout session ID
    const { error: updateError } = await supabaseClient
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("[create-checkout] Failed to update purchase:", updateError);
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id,
        purchase_id: purchase.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[create-checkout] ERROR:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
