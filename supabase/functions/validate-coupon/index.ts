import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateCouponRequest {
  coupon_code: string;
  package_id: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { coupon_code, package_id, user_id }: ValidateCouponRequest = await req.json();

    if (!coupon_code || !package_id) {
      throw new Error("Coupon code and package ID are required");
    }

    // Fetch the coupon
    const { data: coupon, error: couponError } = await supabaseClient
      .from("coupon_codes")
      .select("*")
      .eq("code", coupon_code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (couponError || !coupon) {
      return new Response(
        JSON.stringify({ valid: false, message: "This coupon code is not valid" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check expiration
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ valid: false, message: "This coupon has expired" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return new Response(
        JSON.stringify({ valid: false, message: "This coupon has reached its usage limit" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if coupon applies to this package
    const { data: pkg } = await supabaseClient
      .from("packages")
      .select("slug")
      .eq("id", package_id)
      .single();

    if (!pkg) {
      throw new Error("Package not found");
    }

    const isApplicable = coupon.applicable_packages.length === 0 || 
                         coupon.applicable_packages.includes(pkg.slug) ||
                         coupon.applicable_packages.includes(package_id);

    if (!isApplicable) {
      return new Response(
        JSON.stringify({ valid: false, message: "This coupon is not applicable to the selected package" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check if user has already used this coupon (if user_id provided)
    if (user_id) {
      const { data: usage } = await supabaseClient
        .from("coupon_usage")
        .select("id")
        .eq("coupon_id", coupon.id)
        .eq("user_id", user_id)
        .single();

      if (usage) {
        return new Response(
          JSON.stringify({ valid: false, message: "You have already used this coupon" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Coupon is valid
    return new Response(
      JSON.stringify({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          description: coupon.description
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error validating coupon:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(
      JSON.stringify({ valid: false, message: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});