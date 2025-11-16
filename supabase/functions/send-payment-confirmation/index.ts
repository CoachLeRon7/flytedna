import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmationRequest {
  purchaseId: string;
  userId: string;
  amountPaid: number;
  isFullPayment: boolean;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[send-payment-confirmation] Function invoked");

    const { purchaseId, userId, amountPaid, isFullPayment }: PaymentConfirmationRequest = await req.json();

    if (!purchaseId || !userId || amountPaid === undefined) {
      throw new Error("Missing required fields");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch purchase details
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("purchases")
      .select(`
        *,
        packages (
          name,
          description
        )
      `)
      .eq("id", purchaseId)
      .single();

    if (purchaseError || !purchase) {
      throw new Error(`Purchase not found: ${purchaseError?.message}`);
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`User profile not found: ${profileError?.message}`);
    }

    console.log("[send-payment-confirmation] Sending email to:", profile.email);

    // Fetch installments if it's a payment plan
    let installmentsHtml = "";
    if (purchase.purchase_type === "payment_plan") {
      const { data: installments } = await supabaseClient
        .from("payment_plan_installments")
        .select("*")
        .eq("purchase_id", purchaseId)
        .order("installment_number", { ascending: true });

      if (installments && installments.length > 0) {
        installmentsHtml = `
          <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">Payment Plan Schedule</h3>
            ${installments
              .map(
                (inst) => `
              <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                <span style="color: #6b7280;">Installment #${inst.installment_number} - ${formatDate(inst.due_date)}</span>
                <span style="float: right; font-weight: bold; color: ${inst.paid_at ? "#10b981" : "#374151"};">
                  ${formatCurrency(inst.amount_cents)} ${inst.paid_at ? "✓" : ""}
                </span>
              </div>
            `
              )
              .join("")}
          </div>
        `;
      }
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #111827; font-size: 28px;">Payment ${isFullPayment ? "Confirmed" : "Received"}</h1>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hi ${profile.first_name},
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for your payment! We've successfully received your ${
                  isFullPayment ? "full payment" : "payment"
                } for <strong>${purchase.packages.name}</strong>.
              </p>

              <div style="margin: 30px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111827; font-size: 18px;">
                      ${formatCurrency(amountPaid)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Total Amount:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #111827;">
                      ${formatCurrency(purchase.total_amount_cents)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Payment Type:</td>
                    <td style="padding: 8px 0; text-align: right; color: #111827;">
                      ${purchase.purchase_type === "full_payment" ? "Full Payment" : "Payment Plan"}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Access Period:</td>
                    <td style="padding: 8px 0; text-align: right; color: #111827;">
                      ${formatDate(purchase.membership_start_date)} - ${formatDate(purchase.membership_end_date)}
                    </td>
                  </tr>
                </table>
              </div>

              ${installmentsHtml}

              ${
                isFullPayment
                  ? `
                <div style="margin: 30px 0; padding: 15px; background-color: #d1fae5; border-radius: 8px; border-left: 4px solid #10b981;">
                  <p style="margin: 0; color: #065f46; font-weight: 500;">
                    ✓ Your package access is now active! You can start using all features immediately.
                  </p>
                </div>
              `
                  : `
                <div style="margin: 30px 0; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e;">
                    <strong>Note:</strong> Your package access will be activated once all installments are paid.
                  </p>
                </div>
              `
              }

              <div style="margin: 30px 0; text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "supabase.co")}/dashboard/purchases" 
                   style="display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">
                  View Purchase Details
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                If you have any questions about your purchase, please don't hesitate to contact our support team.
              </p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Flyte Academy. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Flyte Academy <onboarding@resend.dev>",
        to: [profile.email],
        subject: `Payment ${isFullPayment ? "Confirmed" : "Received"} - ${purchase.packages.name}`,
        html: emailHtml,
      }),
    }).then(res => res.json());

    if (error) {
      console.error("[send-payment-confirmation] Resend error:", error);
      throw error;
    }

    console.log("[send-payment-confirmation] Email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id || "sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[send-payment-confirmation] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
