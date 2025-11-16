import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  package_id: string;
  purchase_type: "full" | "payment_plan";
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse and validate request body
    const body: CheckoutRequest = await req.json();
    
    // Input validation
    if (!body.package_id || typeof body.package_id !== "string" || body.package_id.trim().length === 0) {
      throw new Error("Invalid package_id");
    }
    if (!body.purchase_type || !["full", "payment_plan"].includes(body.purchase_type)) {
      throw new Error("Invalid purchase_type. Must be 'full' or 'payment_plan'");
    }

    const { package_id, purchase_type } = body;
    logStep("Request validated", { package_id, purchase_type });

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
    logStep("Package fetched", { name: packageData.name, price: packageData.base_price_cents });

    // Validate payment plan request
    if (purchase_type === "payment_plan") {
      if (!packageData.has_payment_plan) {
        throw new Error("This package does not support payment plans");
      }
      if (!packageData.payment_plan_config) {
        throw new Error("Payment plan configuration missing");
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = newCustomer.id;
      logStep("New customer created", { customerId });
    }

    // Create purchase record in database
    const membershipStartDate = new Date().toISOString().split('T')[0];
    const membershipEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year from now

    const { data: purchaseData, error: purchaseError } = await supabaseClient
      .from("purchases")
      .insert({
        user_id: user.id,
        package_id: package_id,
        total_amount_cents: packageData.base_price_cents,
        purchase_type: purchase_type,
        status: "pending",
        membership_start_date: membershipStartDate,
        membership_end_date: membershipEndDate,
        refund_eligible_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        metadata: {
          package_name: packageData.name,
          package_slug: packageData.slug,
        },
      })
      .select()
      .single();

    if (purchaseError || !purchaseData) {
      logStep("Error creating purchase", { error: purchaseError });
      throw new Error("Failed to create purchase record");
    }
    logStep("Purchase record created", { purchaseId: purchaseData.id });

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || Deno.env.get("SUPABASE_URL");
    let checkoutSession: Stripe.Checkout.Session;

    if (purchase_type === "full") {
      // Full payment checkout
      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: packageData.base_price_cents,
              product_data: {
                name: packageData.name,
                description: packageData.description,
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          purchase_id: purchaseData.id,
          package_id: package_id,
          user_id: user.id,
          purchase_type: "full",
        },
      });
      logStep("Full payment checkout session created", { sessionId: checkoutSession.id });
    } else {
      // Payment plan checkout
      const paymentPlanConfig = packageData.payment_plan_config as any;
      const downPaymentCents = paymentPlanConfig.down_payment_cents;
      const numberOfInstallments = paymentPlanConfig.number_of_installments;
      const remainingAmount = packageData.base_price_cents - downPaymentCents;
      const installmentAmount = Math.ceil(remainingAmount / numberOfInstallments);

      checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: downPaymentCents,
              product_data: {
                name: `${packageData.name} - Down Payment`,
                description: `Initial payment for ${packageData.name}`,
              },
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          purchase_id: purchaseData.id,
          package_id: package_id,
          user_id: user.id,
          purchase_type: "payment_plan",
        },
      });
      logStep("Payment plan checkout session created", { sessionId: checkoutSession.id });

      // Create installment records
      const installments = [];
      const currentDate = new Date();
      
      for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = new Date(currentDate);
        dueDate.setMonth(currentDate.getMonth() + i);
        
        installments.push({
          purchase_id: purchaseData.id,
          installment_number: i,
          amount_cents: installmentAmount,
          due_date: dueDate.toISOString().split('T')[0],
          status: "pending",
        });
      }

      const { error: installmentsError } = await supabaseClient
        .from("payment_plan_installments")
        .insert(installments);

      if (installmentsError) {
        logStep("Error creating installments", { error: installmentsError });
        throw new Error("Failed to create payment plan installments");
      }
      logStep("Installments created", { count: numberOfInstallments });
    }

    // Update purchase with checkout session ID
    await supabaseClient
      .from("purchases")
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq("id", purchaseData.id);

    return new Response(
      JSON.stringify({ 
        url: checkoutSession.url,
        session_id: checkoutSession.id,
        purchase_id: purchaseData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
