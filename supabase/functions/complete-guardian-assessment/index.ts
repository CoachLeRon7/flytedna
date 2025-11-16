import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Secure logging helpers - mask sensitive data
const maskEmail = (email: string) => {
  if (!email) return '[NO_EMAIL]';
  const [user, domain] = email.split('@');
  return `${user.substring(0, 2)}***@${domain}`;
};

const maskUserId = (id: string) => id ? `${id.substring(0, 8)}***` : '[NO_ID]';

const logError = (context: string, error: any) => {
  console.error(`[complete-guardian-assessment] ${context}`, {
    code: error?.code,
    message: error?.message?.substring(0, 100), // Truncate messages
    type: error?.constructor?.name
  });
};

const logInfo = (context: string, data?: Record<string, any>) => {
  const sanitized = data ? Object.entries(data).reduce((acc, [key, val]) => {
    if (key.includes('email')) acc[key] = maskEmail(val);
    else if (key.includes('id') || key.includes('Id')) acc[key] = maskUserId(val);
    else if (key.includes('token')) acc[key] = '[REDACTED]';
    else acc[key] = val;
    return acc;
  }, {} as Record<string, any>) : {};
  
  console.log(`[complete-guardian-assessment] ${context}`, sanitized);
};

const assessmentSchema = z.object({
  invitation_token: z.string().uuid(),
  responses: z.object({
    l1: z.number().int().min(1).max(5),
    l2: z.number().int().min(1).max(5),
    l3: z.number().int().min(1).max(5),
    e1: z.number().int().min(1).max(5),
    e2: z.number().int().min(1).max(5),
    e3: z.number().int().min(1).max(5),
    a1: z.number().int().min(1).max(5),
    a2: z.number().int().min(1).max(5),
    a3: z.number().int().min(1).max(5),
    d1: z.number().int().min(1).max(5),
    d2: z.number().int().min(1).max(5),
    d3: z.number().int().min(1).max(5),
    b1: z.number().int().min(1).max(5),
    b2: z.number().int().min(1).max(5),
    b3: z.number().int().min(1).max(5),
  }),
  optional_comment: z.string().max(1000).optional(),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    // Use service role client to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const validatedData = assessmentSchema.parse(body);

    // Validate invitation token and check if not already completed
    const { data: assessment, error: fetchError } = await supabase
      .from('guardian_assessments')
      .select('id, athlete_id, completed_at, expires_at, timepoint, semester_label')
      .eq('invitation_token', validatedData.invitation_token)
      .is('completed_at', null)
      .single();

    if (fetchError || !assessment) {
      logError('Invalid token', { code: fetchError?.code });
      return new Response(
        JSON.stringify({ error: 'Invalid or expired invitation token' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if invitation has expired
    if (assessment.expires_at && new Date(assessment.expires_at) < new Date()) {
      logError('Expired invitation', {});
      return new Response(
        JSON.stringify({ error: 'This invitation has expired. Please contact the coach for a new invitation.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logInfo('Token validated', { assessment_id: assessment.id, athlete_id: assessment.athlete_id });

    // Calculate domain means
    const responses = validatedData.responses;
    const l_mean = (responses.l1 + responses.l2 + responses.l3) / 3;
    const e_mean = (responses.e1 + responses.e2 + responses.e3) / 3;
    const a_mean = (responses.a1 + responses.a2 + responses.a3) / 3;
    const d_mean = (responses.d1 + responses.d2 + responses.d3) / 3;
    const b_mean = (responses.b1 + responses.b2 + responses.b3) / 3;
    const composite_mean = (l_mean + e_mean + a_mean + d_mean + b_mean) / 5;

    // Update assessment with responses and completion timestamp
    const { error: updateError } = await supabase
      .from('guardian_assessments')
      .update({
        ...responses,
        leadership_dna_mean: Math.round(l_mean * 100) / 100,
        excellence_mean: Math.round(e_mean * 100) / 100,
        accountability_mean: Math.round(a_mean * 100) / 100,
        discipline_mean: Math.round(d_mean * 100) / 100,
        belonging_mean: Math.round(b_mean * 100) / 100,
        composite_mean: Math.round(composite_mean * 100) / 100,
        optional_comment: validatedData.optional_comment || null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessment.id);

    if (updateError) {
      console.error('[complete-guardian-assessment] Update error:', updateError);
      throw updateError;
    }

    console.log('[complete-guardian-assessment] Assessment completed successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Assessment completed successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[complete-guardian-assessment] Error:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
