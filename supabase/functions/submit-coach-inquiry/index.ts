import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { generateRequestId, logInfo, logError } from "../_shared/logging.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Server-side validation schema matching client-side
const coachInquirySchema = z.object({
  coach_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  coach_email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  phone_number: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  organization_name: z.string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(200, "Organization name must be less than 200 characters"),
  sport: z.string()
    .trim()
    .min(2, "Sport must be at least 2 characters")
    .max(50, "Sport must be less than 50 characters"),
  team_size: z.number()
    .int()
    .min(1, "Team size must be at least 1")
    .max(1000, "Team size must be less than 1000"),
  program_type: z.string()
    .min(1, "Please select a program type"),
  message: z.string()
    .trim()
    .max(1000, "Message must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

// Rate limiting: Max 5 inquiries per IP per hour
const checkRateLimit = async (supabase: any, clientIp: string): Promise<boolean> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from("coaches_inquiries")
    .select("id", { count: "exact" })
    .gte("created_at", oneHourAgo)
    .limit(5);
  
  if (error) {
    throw error;
  }
  
  // Allow if less than 5 submissions in past hour
  return (data?.length || 0) < 5;
};

serve(async (req) => {
  const requestId = generateRequestId();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logInfo("Coach inquiry submission started", {}, requestId);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client IP for rate limiting (using Cloudflare headers as fallback)
    const clientIp = req.headers.get("cf-connecting-ip") || 
                     req.headers.get("x-forwarded-for")?.split(",")[0] ||
                     "unknown";

    // Check rate limit
    const withinLimit = await checkRateLimit(supabaseClient, clientIp);
    if (!withinLimit) {
      logInfo("Rate limit exceeded", { ip: clientIp }, requestId);
      return new Response(
        JSON.stringify({ 
          error: "Too many submission attempts. Please try again in an hour." 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = coachInquirySchema.safeParse(body);

    if (!validationResult.success) {
      logInfo("Validation failed", { 
        errors: validationResult.error.issues 
      }, requestId);
      return new Response(
        JSON.stringify({ 
          error: "Validation failed",
          details: validationResult.error.issues 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = validationResult.data;

    // Calculate estimated value
    const estimateValue = (teamSize: number): number => {
      return teamSize * 12500; // $125 average per athlete
    };

    // Insert inquiry
    const { error: insertError } = await supabaseClient
      .from("coaches_inquiries")
      .insert({
        coach_name: data.coach_name,
        coach_email: data.coach_email,
        phone_number: data.phone_number || null,
        organization_name: data.organization_name,
        sport: data.sport,
        team_size: data.team_size,
        program_type: data.program_type,
        message: data.message || null,
        estimated_value_cents: estimateValue(data.team_size),
      });

    if (insertError) {
      throw insertError;
    }

    logInfo("Coach inquiry submitted successfully", {}, requestId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Inquiry submitted successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    logError("Error submitting coach inquiry", error, requestId);
    return new Response(
      JSON.stringify({ 
        error: "Failed to submit inquiry. Please try again." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
