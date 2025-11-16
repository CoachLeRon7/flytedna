import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    console.log("[send-installment-reminder] Function invoked");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Find installments due in the next 7 days that haven't been paid
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const { data: upcomingInstallments, error: installmentsError } = await supabaseClient
      .from("payment_plan_installments")
      .select(`
        *,
        purchases (
          user_id,
          package_id,
          packages (
            name,
            description
          )
        )
      `)
      .is("paid_at", null)
      .eq("status", "pending")
      .lte("due_date", sevenDaysFromNow.toISOString().split("T")[0])
      .gte("due_date", threeDaysFromNow.toISOString().split("T")[0]);

    if (installmentsError) {
      throw new Error(`Failed to fetch installments: ${installmentsError.message}`);
    }

    if (!upcomingInstallments || upcomingInstallments.length === 0) {
      console.log("[send-installment-reminder] No upcoming installments found");
      return new Response(
        JSON.stringify({ message: "No upcoming installments to remind" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[send-installment-reminder] Found ${upcomingInstallments.length} installments to remind`);

    const emailPromises = upcomingInstallments.map(async (installment: any) => {
      const purchase = installment.purchases;
      if (!purchase || !purchase.user_id) {
        console.error("[send-installment-reminder] Invalid purchase data for installment:", installment.id);
        return null;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabaseClient
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", purchase.user_id)
        .single();

      if (profileError || !profile) {
        console.error("[send-installment-reminder] User profile not found:", purchase.user_id);
        return null;
      }

      const daysUntilDue = Math.ceil(
        (new Date(installment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Reminder</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="margin: 0; color: #111827; font-size: 28px;">Payment Reminder</h1>
                </div>

                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  Hi ${profile.first_name},
                </p>

                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  This is a friendly reminder that you have an upcoming payment due for your <strong>${purchase.packages.name}</strong> package.
                </p>

                <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">
                    Payment Due ${daysUntilDue <= 3 ? "Soon" : `in ${daysUntilDue} Days`}
                  </h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #92400e;">Installment:</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #78350f;">
                        #${installment.installment_number}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #92400e;">Amount Due:</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #78350f; font-size: 20px;">
                        ${formatCurrency(installment.amount_cents)}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #92400e;">Due Date:</td>
                      <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #78350f;">
                        ${formatDate(installment.due_date)}
                      </td>
                    </tr>
                  </table>
                </div>

                <div style="margin: 30px 0; padding: 15px; background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                    <strong>Note:</strong> Your payment will be automatically processed on the due date using your saved payment method. Please ensure you have sufficient funds available.
                  </p>
                </div>

                <div style="margin: 30px 0; text-align: center;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "supabase.co")}/dashboard/purchases" 
                     style="display: inline-block; padding: 12px 30px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; margin-right: 10px;">
                    View Payment Details
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                  If you have any questions or need to update your payment method, please contact our support team.
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

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Flyte Academy <onboarding@resend.dev>",
            to: [profile.email],
            subject: `Payment Reminder: ${formatCurrency(installment.amount_cents)} Due ${formatDate(installment.due_date)}`,
            html: emailHtml,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("[send-installment-reminder] Resend error for installment:", installment.id, result);
          return null;
        }

        console.log("[send-installment-reminder] Email sent to:", profile.email);
        return { installmentId: installment.id, emailId: result?.id || "sent" };
      } catch (error: any) {
        console.error("[send-installment-reminder] Error sending email:", error);
        return null;
      }
    });

    const results = await Promise.all(emailPromises);
    const successful = results.filter((r) => r !== null);

    console.log(`[send-installment-reminder] Sent ${successful.length} reminder emails`);

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent: successful.length,
        results: successful,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[send-installment-reminder] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
