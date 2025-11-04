import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  organizationName: string;
  roleName: string;
  teamName?: string;
  inviterName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, organizationName, roleName, teamName, inviterName }: InvitationEmailRequest = await req.json();

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

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
