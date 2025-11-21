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
  coupon_code?: string;
  metadata?: Record<string, any>;
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
    const { package_id, payment_type = "full_payment", coupon_code, metadata } = body;

    if (!package_id) {
      throw new Error("package_id is required");
    }

    console.log("[create-checkout] Request:", { package_id, payment_type, coupon_code });

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

    // Validate Price ID exists for full payments
    if (payment_type === "full_payment" && !packageData.stripe_price_id) {
      throw new Error(`Package "${packageData.name}" does not have a Stripe Price ID configured`);
    }

    console.log("[create-checkout] Package found:", {
      name: packageData.name,
      price_id: packageData.stripe_price_id,
      payment_type
    });

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

    // Validate and apply coupon if provided
    let couponData: any = null;
    let discountAmountCents = 0;

    if (coupon_code) {
      const { data: coupon, error: couponError } = await supabaseClient
        .from("coupon_codes")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (!coupon || couponError) {
        throw new Error("Invalid coupon code");
      }

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error("Coupon has expired");
      }

      // Check max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        throw new Error("Coupon usage limit reached");
      }

      // Check if applicable to package
      const isApplicable = coupon.applicable_packages.length === 0 || 
                           coupon.applicable_packages.includes(packageData.slug) ||
                           coupon.applicable_packages.includes(package_id);

      if (!isApplicable) {
        throw new Error("Coupon not applicable to this package");
      }

      // Check if user already used this coupon
      const { data: existingUsage } = await supabaseClient
        .from("coupon_usage")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user.id)
        .single();

      if (existingUsage) {
        throw new Error("You have already used this coupon");
      }

      couponData = coupon;

      // Calculate discount
      if (coupon.discount_type === "percentage") {
        discountAmountCents = Math.floor((packageData.base_price_cents * coupon.discount_value) / 100);
      } else {
        discountAmountCents = coupon.discount_value;
      }

      console.log("[create-checkout] Coupon applied:", { code: coupon.code, discount: discountAmountCents });
    }

    // Calculate amounts
    const totalAmount = packageData.base_price_cents - discountAmountCents;
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
          ...(couponData && {
            coupon_code: couponData.code,
            coupon_discount_cents: discountAmountCents,
            original_price_cents: packageData.base_price_cents,
          }),
          ...(metadata || {}),
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
        payment_type === "payment_plan" 
          ? {
              // For payment plans, use price_data for flexible down payment amounts
              price_data: {
                currency: "usd",
                unit_amount: initialPayment,
                product_data: {
                  name: `${packageData.name} - Down Payment`,
                  description: `Initial payment for ${packageData.name}`,
                },
              },
              quantity: 1,
            }
          : {
              // For full payments, use the Price ID from Stripe
              price: packageData.stripe_price_id!,
              quantity: 1,
            }
      ],
      mode: "payment",
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        purchase_id: purchase.id,
        package_id: package_id,
        user_id: user.id,
        payment_type: payment_type,
        ...(couponData && {
          coupon_code: couponData.code,
          coupon_id: couponData.id,
          discount_applied_cents: discountAmountCents,
        }),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("[create-checkout] Checkout session created:", {
      session_id: session.id,
      payment_type,
      amount: initialPayment,
      used_price_id: payment_type === "full_payment",
      price_id: payment_type === "full_payment" ? packageData.stripe_price_id : null
    });

    // Update purchase with checkout session ID
    const { error: updateError } = await supabaseClient
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("[create-checkout] Failed to update purchase:", updateError);
    }

    // Track coupon usage if coupon was applied
    if (couponData) {
      // Record coupon usage
      const { error: usageError } = await supabaseClient
        .from("coupon_usage")
        .insert({
          coupon_id: couponData.id,
          user_id: user.id,
          purchase_id: purchase.id,
          discount_applied_cents: discountAmountCents,
        });

      if (usageError) {
        console.error("[create-checkout] Failed to record coupon usage:", usageError);
      }

      // Increment coupon usage counter
      const { error: incrementError } = await supabaseClient
        .from("coupon_codes")
        .update({ current_uses: couponData.current_uses + 1 })
        .eq("id", couponData.id);

      if (incrementError) {
        console.error("[create-checkout] Failed to increment coupon usage:", incrementError);
      }

      console.log("[create-checkout] Coupon usage tracked:", { 
        coupon_id: couponData.id, 
        discount: discountAmountCents 
      });
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
