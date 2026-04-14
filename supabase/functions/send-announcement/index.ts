import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { generateRequestId, logError, logInfo } from '../_shared/logging.ts';

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

// HTML escape function to prevent XSS in email templates
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handler = async (req: Request): Promise<Response> => {
  const requestId = req.headers.get('x-request-id') || generateRequestId();
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, 'x-request-id': requestId } });
  }

  try {
    logInfo('Request received', {}, requestId);
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
      logError('Authentication failed', userError, requestId);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders, 'x-request-id': requestId },
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

    // Check rate limit (10 announcements per hour)
    const { data: rateLimitCheck, error: rateLimitError } = await supabase.rpc(
      'check_announcement_rate_limit',
      { _user_id: user.id, _max_per_hour: 10 }
    );

    if (rateLimitError) {
      logError('Rate limit check failed', rateLimitError, requestId);
      return new Response(
        JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders, 'x-request-id': requestId } }
      );
    }

    if (!rateLimitCheck.allowed) {
      logInfo('Rate limit exceeded', { limit: rateLimitCheck.limit }, requestId);
      return new Response(
        JSON.stringify({ 
          error: rateLimitCheck.message,
          rateLimitExceeded: true,
          count: rateLimitCheck.count,
          limit: rateLimitCheck.limit
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders, 'x-request-id': requestId } }
      );
    }

    logInfo('Rate limit check passed', { remaining: rateLimitCheck.remaining, limit: rateLimitCheck.limit }, requestId);

    const { title, message, targetAudience, sendEmail }: AnnouncementRequest = await req.json();

    // Validate input lengths
    if (!title || title.trim().length === 0 || title.length > 200) {
      return new Response(
        JSON.stringify({ error: "Invalid title: must be between 1 and 200 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || message.trim().length === 0 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Invalid message: must be between 1 and 5000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    logInfo('Processing announcement', { targetAudience, sendEmail }, requestId);

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

    logInfo('Target users found', { recipientsCount: targetUserIds.length }, requestId);

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
      logError('Announcement creation failed', announcementError, requestId);
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
      logError('Notifications creation failed', notifError, requestId);
    }

    // Record the announcement send for rate limiting
    const { error: recordError } = await supabase.rpc(
      'record_announcement_send',
      { _user_id: user.id }
    );

    if (recordError) {
      logError('Rate limit recording failed', recordError, requestId);
      // Continue anyway - don't block announcement
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
              subject: `📢 ${escapeHtml(title)}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1e40af;">FLY.TE Academy Announcement</h1>
                  <h2>${escapeHtml(title)}</h2>
                  <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
                  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px;">
                    This message was sent to ${escapeHtml(recipient.name)} as part of a program announcement.
                  </p>
                </div>
              `,
            });
            emailsSent++;
          } catch (emailError) {
            logError('Individual email send failed', emailError, requestId);
          }
        }

        logInfo('Emails sent', { emailsSent }, requestId);
      } catch (error) {
        logError('Email sending failed', error, requestId);
      }
    }

    logInfo('Announcement sent successfully', { recipientsCount: targetUserIds.length, emailsSent }, requestId);
    
    return new Response(
      JSON.stringify({
        success: true,
        announcementId: announcement.id,
        recipientsCount: targetUserIds.length,
        emailsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders, 'x-request-id': requestId },
      }
    );
  } catch (error: any) {
    logError('Function error', error, requestId);
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders, 'x-request-id': requestId },
      }
    );
  }
};

serve(handler);
