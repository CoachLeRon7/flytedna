import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Secure logging helpers
const maskEmail = (email: string) => {
  if (!email) return '[NO_EMAIL]';
  const [user, domain] = email.split('@');
  return `${user.substring(0, 2)}***@${domain}`;
};

const maskUserId = (id: string) => id ? `${id.substring(0, 8)}***` : '[NO_ID]';

const logError = (context: string, error: any) => {
  console.error(`[send-invitation] ${context}`, {
    code: error?.code,
    message: error?.message?.substring(0, 100),
    type: error?.constructor?.name
  });
};

const logInfo = (context: string, data?: Record<string, any>) => {
  const sanitized = data ? Object.entries(data).reduce((acc, [key, val]) => {
    if (key.includes('email')) acc[key] = maskEmail(val);
    else if (key.includes('id') || key.includes('Id')) acc[key] = maskUserId(val);
    else acc[key] = val;
    return acc;
  }, {} as Record<string, any>) : {};
  
  console.log(`[send-invitation] ${context}`, sanitized);
};

// Input validation schema
const invitationSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  organizationName: z.string().min(1, "Organization name is required").max(200, "Organization name must be less than 200 characters"),
  roleName: z.enum(['org_admin', 'coach', 'student'], { errorMap: () => ({ message: "Invalid role" }) }),
  teamName: z.string().max(200, "Team name must be less than 200 characters").optional(),
  inviterName: z.string().min(1, "Inviter name is required").max(200, "Inviter name must be less than 200 characters"),
  organizationId: z.string().uuid("Invalid organization ID format"),
});

interface InvitationEmailRequest {
  email: string;
  organizationName: string;
  roleName: string;
  teamName?: string;
  inviterName: string;
  organizationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 2. Parse and validate input
    const requestBody = await req.json();
    const validationResult = invitationSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return new Response(
        JSON.stringify({ error: `Validation failed: ${errorMessage}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { email, organizationName, roleName, teamName, inviterName, organizationId }: InvitationEmailRequest = validationResult.data;

    // 3. Check authorization - user must be org admin or super admin
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: user.id });
    const { data: isOrgAdmin } = await supabase.rpc('is_org_admin', { 
      _user_id: user.id, 
      _org_id: organizationId 
    });

    if (!isSuperAdmin && !isOrgAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden: You must be an organization admin to send invitations" }),
        { 
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // 4. Check rate limiting (10 invitations per hour per user)
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc('check_announcement_rate_limit', {
      _user_id: user.id,
      _max_per_hour: 10
    });

    if (rateLimitError) {
      logError('Rate limit check failed', rateLimitError);
    } else if (rateLimitCheck && !rateLimitCheck.allowed) {
      logInfo('Rate limit exceeded', { limit: rateLimitCheck.limit, user: maskUserId(user.id) });
      logInfo('Rate limit exceeded', { limit: rateLimitCheck.limit, user: maskUserId(user.id) });
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded: You can only send ${rateLimitCheck.limit} invitations per hour. Please try again later.`,
          remaining: 0,
          limit: rateLimitCheck.limit
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    logInfo('Sending invitation', { email: maskEmail(email), organization: organizationName, role: roleName });

    const teamInfo = teamName ? ` to join the <strong>${teamName}</strong> team` : '';
    
    const emailResponse = await resend.emails.send({
      from: "Flyte Academy <onboarding@resend.dev>",
      to: [email],
      subject: `You've been invited to join ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Flyte Academy!</h1>
          <p style="font-size: 16px; color: #555;">
            <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${roleName}</strong>${teamInfo}.
          </p>
          <p style="font-size: 16px; color: #555;">
            To accept this invitation, please sign up using this email address:
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #333;">${email}</p>
          </div>
          <p style="font-size: 14px; color: #777;">
            This invitation will expire in 7 days.
          </p>
          <p style="font-size: 14px; color: #777;">
            If you have any questions, please contact your administrator.
          </p>
        </div>
      `,
    });

    logInfo('Email sent');

    // 5. Record the send for rate limiting
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase.rpc('record_announcement_send', { _user_id: user.id });
    } catch (recordError) {
      logError('Rate limit recording failed', recordError);
      // Don't fail the request if rate limit recording fails
    }

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    logError('Function error', error);
    
    // Return generic error message to prevent information leakage
    const statusCode = error.status || 500;
    return new Response(
      JSON.stringify({ error: "An error occurred sending the invitation. Please try again." }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
