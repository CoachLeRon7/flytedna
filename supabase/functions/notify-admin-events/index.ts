import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  event_type: 'new_signup' | 'pilot_enrollment' | 'purchase_completed';
  user_email: string;
  user_name: string;
  additional_data?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { event_type, user_email, user_name, additional_data }: NotificationRequest = await req.json();

    console.log(`Processing admin notification: ${event_type} for ${user_email}`);

    // Fetch all FlyteDNA admins
    const { data: adminProfiles, error: adminError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .ilike('email', '%@flytedna.com');

    if (adminError) {
      console.error('Error fetching admins:', adminError);
      throw adminError;
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('No FlyteDNA admins found');
      return new Response(
        JSON.stringify({ message: 'No admins to notify' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmails = adminProfiles.map(p => p.email);
    console.log(`Notifying ${adminEmails.length} admins:`, adminEmails);

    // Format email content based on event type
    let subject = '';
    let htmlContent = '';

    switch (event_type) {
      case 'new_signup':
        subject = '🎉 New User Signup on FlyteDNA';
        htmlContent = `
          <h2>New User Signup</h2>
          <p>A new user has signed up for FlyteDNA:</p>
          <ul>
            <li><strong>Name:</strong> ${user_name}</li>
            <li><strong>Email:</strong> ${user_email}</li>
            <li><strong>Registration Type:</strong> ${additional_data?.registration_type || 'N/A'}</li>
            <li><strong>Sport:</strong> ${additional_data?.sport || 'N/A'}</li>
            <li><strong>Referral Source:</strong> ${additional_data?.referral_source || 'N/A'}</li>
          </ul>
          <p>View their profile in the <a href="https://${supabaseUrl.replace('https://', '')}/dashboard/admin">Admin Dashboard</a></p>
        `;
        break;

      case 'pilot_enrollment':
        subject = '🚀 New Pilot Program Enrollment';
        htmlContent = `
          <h2>Pilot Program Enrollment</h2>
          <p>A user has enrolled in the pilot program:</p>
          <ul>
            <li><strong>Name:</strong> ${user_name}</li>
            <li><strong>Email:</strong> ${user_email}</li>
            <li><strong>Pilot Code:</strong> ${additional_data?.pilot_code || 'N/A'}</li>
            <li><strong>Expires:</strong> ${additional_data?.expires_at || 'N/A'}</li>
          </ul>
          <p>View their profile in the <a href="https://${supabaseUrl.replace('https://', '')}/dashboard/admin">Admin Dashboard</a></p>
        `;
        break;

      case 'purchase_completed':
        subject = '💳 New Purchase Completed';
        htmlContent = `
          <h2>Purchase Completed</h2>
          <p>A user has completed a purchase:</p>
          <ul>
            <li><strong>Name:</strong> ${user_name}</li>
            <li><strong>Email:</strong> ${user_email}</li>
            <li><strong>Package:</strong> ${additional_data?.package_name || 'N/A'}</li>
            <li><strong>Amount:</strong> $${((additional_data?.amount_cents || 0) / 100).toFixed(2)}</li>
            <li><strong>Payment Type:</strong> ${additional_data?.purchase_type || 'N/A'}</li>
          </ul>
          <p>View purchase details in the <a href="https://${supabaseUrl.replace('https://', '')}/dashboard/admin">Admin Dashboard</a></p>
        `;
        break;
    }

    // Send email to all admins
    const emailResponse = await resend.emails.send({
      from: "FlyteDNA Notifications <notifications@flytedna.com>",
      to: adminEmails,
      subject: subject,
      html: htmlContent,
    });

    console.log("Admin notification sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, notified_admins: adminEmails.length }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-admin-events function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
