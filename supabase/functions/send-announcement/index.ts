import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnnouncementRequest {
  title: string;
  message: string;
  targetAudience: string; // 'all', 'students', 'coaches', 'team:uuid'
  sendEmail: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authenticated user from the JWT (already verified by Supabase)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify admin role
    const { data: isAdmin } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized - Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { title, message, targetAudience, sendEmail }: AnnouncementRequest = await req.json();

    console.log("Processing announcement:", { title, targetAudience, sendEmail });

    // Get target users based on audience
    let targetUserIds: string[] = [];
    let recipientEmails: { email: string; name: string }[] = [];

    if (targetAudience === "all") {
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name");
      
      if (allProfiles) {
        targetUserIds = allProfiles.map(p => p.id);
        recipientEmails = allProfiles.map(p => ({
          email: p.email,
          name: `${p.first_name} ${p.last_name}`
        }));
      }
    } else if (targetAudience === "students") {
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");
      
      if (studentRoles) {
        targetUserIds = studentRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name")
          .in("id", targetUserIds);
        
        if (profiles) {
          recipientEmails = profiles.map(p => ({
            email: p.email,
            name: `${p.first_name} ${p.last_name}`
          }));
        }
      }
    } else if (targetAudience === "coaches") {
      const { data: coachRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "coach");
      
      if (coachRoles) {
        targetUserIds = coachRoles.map(r => r.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, first_name, last_name")
          .in("id", targetUserIds);
        
        if (profiles) {
          recipientEmails = profiles.map(p => ({
            email: p.email,
            name: `${p.first_name} ${p.last_name}`
          }));
        }
      }
    } else if (targetAudience.startsWith("team:")) {
      const teamId = targetAudience.replace("team:", "");
      const { data: teamProfiles } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("team_id", teamId);
      
      if (teamProfiles) {
        targetUserIds = teamProfiles.map(p => p.id);
        recipientEmails = teamProfiles.map(p => ({
          email: p.email,
          name: `${p.first_name} ${p.last_name}`
        }));
      }
    }

    console.log(`Found ${targetUserIds.length} target users`);

    // Create announcement record
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .insert({
        created_by: user.id,
        title,
        message,
        target_audience: targetAudience,
        email_sent: sendEmail,
        recipients_count: targetUserIds.length,
      })
      .select()
      .single();

    if (announcementError) {
      console.error("Error creating announcement:", announcementError);
      throw announcementError;
    }

    // Create in-app notifications for all target users
    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      announcement_id: announcement.id,
      title,
      message,
    }));

    const { error: notifError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    // Send emails if requested
    let emailsSent = 0;
    if (sendEmail && resendApiKey && recipientEmails.length > 0) {
      const resend = new Resend(resendApiKey);

      try {
        // Send individual emails to each recipient
        for (const recipient of recipientEmails) {
          try {
            await resend.emails.send({
              from: "FLY.TE Academy <onboarding@resend.dev>",
              to: [recipient.email],
              subject: `📢 ${title}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1e40af;">FLY.TE Academy Announcement</h1>
                  <h2>${title}</h2>
                  <p style="white-space: pre-wrap;">${message}</p>
                  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">
                    This message was sent to ${recipient.name} as part of a program announcement.
                  </p>
                </div>
              `,
            });
            emailsSent++;
          } catch (emailError) {
            console.error(`Failed to send email to ${recipient.email}:`, emailError);
          }
        }

        console.log(`Successfully sent ${emailsSent} emails`);
      } catch (error) {
        console.error("Email sending error:", error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        announcementId: announcement.id,
        recipientsCount: targetUserIds.length,
        emailsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-announcement function:", error);
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
