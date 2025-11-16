import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const invitationSchema = z.object({
  athleteId: z.string().uuid(),
  guardianEmail: z.string().email(),
  guardianName: z.string().min(1),
  guardianRelationship: z.enum(['parent', 'guardian', 'mentor', 'other']),
  timepoint: z.enum(['pre', 'mid', 'end']),
  semesterLabel: z.string(),
});

interface GuardianInvitationRequest {
  athleteId: string;
  guardianEmail: string;
  guardianName: string;
  guardianRelationship: string;
  timepoint: string;
  semesterLabel: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: GuardianInvitationRequest = await req.json();
    const validatedData = invitationSchema.parse(body);

    // Check authorization
    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin', { _user_id: user.id });
    const { data: athleteProfile } = await supabase
      .from('profiles')
      .select('team_id, first_name, last_name')
      .eq('id', validatedData.athleteId)
      .single();

    if (!athleteProfile) {
      return new Response(JSON.stringify({ error: 'Athlete not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is coach for the athlete's team or is the athlete themselves
    let authorized = isSuperAdmin || user.id === validatedData.athleteId;
    if (!authorized && athleteProfile.team_id) {
      const { data: isCoach } = await supabase.rpc('is_coach_for_team', {
        _coach_id: user.id,
        _team_id: athleteProfile.team_id
      });
      authorized = isCoach;
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Permission denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create guardian assessment invitation
    const { data: invitation, error: insertError } = await supabase
      .from('guardian_assessments')
      .insert({
        athlete_id: validatedData.athleteId,
        guardian_email: validatedData.guardianEmail,
        guardian_name: validatedData.guardianName,
        guardian_relationship: validatedData.guardianRelationship,
        timepoint: validatedData.timepoint,
        semester_label: validatedData.semesterLabel,
        invited_by: user.id,
      })
      .select('invitation_token')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to create invitation', details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send email using Resend
    const resend = new Resend(resendApiKey);
    const invitationUrl = `${supabaseUrl.replace('.supabase.co', '')}/guardian/assess?token=${invitation.invitation_token}`;
    
    const timepointDisplay = {
      pre: 'Pre-Season',
      mid: 'Mid-Season',
      end: 'Post-Season'
    }[validatedData.timepoint];

    const emailResponse = await resend.emails.send({
      from: 'Flyte Academy <onboarding@resend.dev>',
      to: [validatedData.guardianEmail],
      subject: `Leadership Assessment Request for ${athleteProfile.first_name} ${athleteProfile.last_name}`,
      html: `
        <h1>Leadership Assessment Request</h1>
        <p>Hello ${validatedData.guardianName},</p>
        <p>You've been invited to provide leadership feedback for <strong>${athleteProfile.first_name} ${athleteProfile.last_name}</strong> as part of their ${timepointDisplay} assessment.</p>
        <p>Your insights as their ${validatedData.guardianRelationship} are valuable in helping them develop their leadership skills.</p>
        <p>The assessment takes approximately 10 minutes to complete.</p>
        <p><a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1E40AF; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Complete Assessment</a></p>
        <p>If the button doesn't work, copy and paste this link: ${invitationUrl}</p>
        <p>This invitation will expire in 30 days.</p>
        <p>Thank you for supporting ${athleteProfile.first_name}'s leadership development journey!</p>
        <p>Best regards,<br>Flyte Academy</p>
      `,
    });

    console.log('Guardian invitation sent:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Guardian invitation sent successfully',
      invitationToken: invitation.invitation_token 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in send-guardian-invitation:', error);
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Invalid request data', details: error.errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
