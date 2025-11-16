import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RefundStatusEmailRequest {
  refundRequestId: string;
  status: "approved" | "rejected";
}

const generateEmailHTML = (
  userName: string,
  packageName: string,
  amount: string,
  status: "approved" | "rejected",
  adminNotes: string | null,
  dashboardUrl: string
) => {
  const isApproved = status === "approved";
  const statusColor = isApproved ? "#10b981" : "#ef4444";
  const statusIcon = isApproved ? "✓" : "✗";
  const statusTitle = isApproved ? "Refund Request Approved" : "Refund Request Update";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusTitle}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f6f9fc;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: ${statusColor}; margin-top: 0; font-size: 24px; font-weight: bold;">
            ${statusIcon} ${statusTitle}
          </h1>
          
          <p style="font-size: 16px; margin: 20px 0;">
            Hi ${userName},
          </p>
          
          <p style="font-size: 16px; margin: 20px 0;">
            Your refund request for <strong>${packageName}</strong> (${amount}) has been <strong>${status}</strong>.
          </p>

          ${isApproved ? `
            <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">
                <strong>✓ Your refund has been approved!</strong>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">
                The refund will be processed to your original payment method within 5-10 business days.
              </p>
            </div>
          ` : `
            <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">
                <strong>Your refund request was not approved.</strong>
              </p>
            </div>
          `}

          ${adminNotes ? `
            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;">
            
            <p style="font-size: 16px; font-weight: bold; margin: 20px 0 8px 0;">
              Message from our team:
            </p>
            
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; margin: 8px 0 20px 0;">
              <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${adminNotes}</p>
            </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;">

          <p style="font-size: 16px; margin: 20px 0;">
            You can view your purchase history and refund status in your dashboard:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="display: inline-block; background-color: #1E40AF; color: #ffffff; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              View Dashboard
            </a>
          </div>

          ${!isApproved ? `
            <p style="font-size: 14px; color: #666; margin: 20px 0;">
              If you have questions about this decision, please contact our support team.
            </p>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 30px 0;">

          <p style="font-size: 12px; color: #8898aa; margin: 20px 0 0 0; text-align: center;">
            <a href="${dashboardUrl.replace('/dashboard/purchases', '')}" style="color: #8898aa; text-decoration: none;">
              Flyte Academy
            </a>
            <br>
            Leadership Development Program
          </p>
        </div>
      </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { refundRequestId, status }: RefundStatusEmailRequest = await req.json();

    console.log("Processing refund status email:", { refundRequestId, status });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch refund request details with related data
    const { data: refundRequest, error: fetchError } = await supabaseClient
      .from("refund_requests")
      .select(`
        *,
        purchases (
          total_amount_cents,
          packages (
            name
          )
        ),
        profiles!refund_requests_user_id_fkey (
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", refundRequestId)
      .single();

    if (fetchError || !refundRequest) {
      throw new Error(`Failed to fetch refund request: ${fetchError?.message}`);
    }

    console.log("Fetched refund request for user:", refundRequest.profiles.email);

    // Format amount
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(refundRequest.purchases.total_amount_cents / 100);

    // Get dashboard URL
    const origin = req.headers.get("origin") || "https://flyte-academy.lovable.app";
    const dashboardUrl = `${origin}/dashboard/purchases`;

    // Generate email HTML
    const html = generateEmailHTML(
      `${refundRequest.profiles.first_name} ${refundRequest.profiles.last_name}`,
      refundRequest.purchases.packages.name,
      amount,
      status,
      refundRequest.admin_notes,
      dashboardUrl
    );

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Flyte Academy <onboarding@resend.dev>",
      to: [refundRequest.profiles.email],
      subject: `Refund Request ${status === "approved" ? "Approved" : "Update"} - ${refundRequest.purchases.packages.name}`,
      html: html,
    });

    if (emailError) {
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        emailId: emailData?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-refund-status-email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
