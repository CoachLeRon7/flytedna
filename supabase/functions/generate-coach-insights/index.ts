import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { generateRequestId, logError, logInfo, startPerformanceTimer, checkpoint, logPerformance, measureAsync } from '../_shared/logging.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


// Define schema for AI insights validation
const insightsSchema = z.object({
  summary: z.string().min(10).max(500),
  strengths: z.array(
    z.object({
      domain: z.string(),
      score: z.number().min(1).max(5),
      analysis: z.string().min(10).max(500),
    })
  ).min(2).max(2),
  weaknesses: z.array(
    z.object({
      domain: z.string(),
      score: z.number().min(1).max(5),
      analysis: z.string().min(10).max(500),
    })
  ).min(2).max(2),
  actionable_steps: z.array(
    z.object({
      title: z.string().min(5).max(100),
      description: z.string().min(10).max(500),
      domain: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ).min(3).max(5),
});

serve(async (req) => {
  // Extract or generate request ID
  const requestId = req.headers.get('x-request-id') || generateRequestId();
  const perfTimer = startPerformanceTimer(requestId);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, 'x-request-id': requestId } });
  }

  try {
    logInfo('Request received', {}, requestId);
    checkpoint(perfTimer, 'init');
    
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Create client for auth check
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    checkpoint(perfTimer, 'auth_check');
    
    if (authError || !user) {
      logError('Authentication failed', authError, requestId);
      logPerformance(perfTimer, 'generate-coach-insights:unauthorized');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId } }
      );
    }

    // Verify user is a coach or admin
    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    checkpoint(perfTimer, 'role_check');
    
    const roles = userRoles?.map(r => r.role) || [];
    if (!roles.includes('coach') && !roles.includes('admin')) {
      logPerformance(perfTimer, 'generate-coach-insights:forbidden');
      return new Response(
        JSON.stringify({ error: 'Forbidden: Only coaches and admins can generate insights' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { assessmentId } = await req.json();
    if (!assessmentId) {
      throw new Error("Assessment ID is required");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch coach assessment with athlete profile
    const { data: assessment, error: fetchError } = await supabase
      .from('coach_assessments')
      .select('*, profiles!athlete_id(first_name, last_name)')
      .eq('id', assessmentId)
      .single();

    checkpoint(perfTimer, 'assessment_fetched');

    if (fetchError || !assessment) {
      logError('Assessment fetch failed', fetchError, requestId);
      logPerformance(perfTimer, 'generate-coach-insights:fetch_failed');
      throw new Error("Could not fetch assessment");
    }

    const athleteName = `${assessment.profiles.first_name} ${assessment.profiles.last_name}`;

    // Prepare domain scores
    const domains = [
      { name: "Leadership DNA", score: assessment.leadership_dna_mean },
      { name: "Excellence", score: assessment.excellence_mean },
      { name: "Accountability", score: assessment.accountability_mean },
      { name: "Discipline", score: assessment.discipline_mean },
      { name: "Belonging", score: assessment.belonging_mean },
    ];

    // Sort to find strengths and weaknesses
    const sortedDomains = [...domains].sort((a, b) => b.score - a.score);
    const strengths = sortedDomains.slice(0, 2);
    const weaknesses = sortedDomains.slice(-2);

    // Construct prompt for AI
    const prompt = `You are a leadership development coach analyzing an athlete's leadership assessment results.

Athlete: ${athleteName}
Timepoint: ${assessment.timepoint}
Composite Score: ${assessment.composite_mean}/5.0
Classification: ${assessment.classification}

Domain Scores:
- Leadership DNA: ${assessment.leadership_dna_mean}/5.0
- Excellence: ${assessment.excellence_mean}/5.0
- Accountability: ${assessment.accountability_mean}/5.0
- Discipline: ${assessment.discipline_mean}/5.0
- Belonging & Impact: ${assessment.belonging_mean}/5.0

Coach Reflections:
${assessment.reflection_voluntary_followership ? `- Voluntary Followership: ${assessment.reflection_voluntary_followership}` : ''}
${assessment.reflection_greatest_impact ? `- Greatest Impact: ${assessment.reflection_greatest_impact}` : ''}
${assessment.reflection_growth_area ? `- Growth Area: ${assessment.reflection_growth_area}` : ''}

Analyze this athlete's leadership profile and provide:
1. A 2-3 sentence overall summary of their leadership style
2. Analysis of their top 2 strengths (${strengths.map(s => s.name).join(', ')})
3. Analysis of their top 2 growth areas (${weaknesses.map(w => w.name).join(', ')})
4. 3-5 specific, actionable starting points for immediate development

Be specific, constructive, and actionable. Reference the scores and reflections where relevant.`;

    checkpoint(perfTimer, 'prompt_prepared');

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert leadership development coach providing constructive, actionable feedback to athletes.' },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_leadership_insights',
              description: 'Provide structured leadership development insights for an athlete',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: '2-3 sentence overall leadership profile summary'
                  },
                  strengths: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: { type: 'string' },
                        score: { type: 'number' },
                        analysis: { type: 'string', description: '2-3 sentences explaining why this is a strength' }
                      },
                      required: ['domain', 'score', 'analysis']
                    },
                    minItems: 2,
                    maxItems: 2
                  },
                  weaknesses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        domain: { type: 'string' },
                        score: { type: 'number' },
                        analysis: { type: 'string', description: '2-3 sentences explaining the growth opportunity' }
                      },
                      required: ['domain', 'score', 'analysis']
                    },
                    minItems: 2,
                    maxItems: 2
                  },
                  actionable_steps: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: 'Short action title' },
                        description: { type: 'string', description: 'Specific action description' },
                        domain: { type: 'string', description: 'Which domain this targets' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                      },
                      required: ['title', 'description', 'domain', 'priority']
                    },
                    minItems: 3,
                    maxItems: 5
                  }
                },
                required: ['summary', 'strengths', 'weaknesses', 'actionable_steps']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_leadership_insights' } }
      }),
    });

    checkpoint(perfTimer, 'ai_call');

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      logError('AI Gateway error', { status: aiResponse.status, errorText: errorText.substring(0, 100) }, requestId);
      logPerformance(perfTimer, 'generate-coach-insights:ai_failed');
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      logPerformance(perfTimer, 'generate-coach-insights:no_insights');
      throw new Error("No insights generated");
    }

    // Parse and validate AI response with error handling
    let insights;
    try {
      const rawInsights = JSON.parse(toolCall.function.arguments);
      insights = insightsSchema.parse(rawInsights);
      checkpoint(perfTimer, 'insights_validated');
    } catch (parseError) {
      logError('Failed to parse/validate AI insights', parseError, requestId);
      logPerformance(perfTimer, 'generate-coach-insights:validation_failed');
      if (parseError instanceof z.ZodError) {
        logError('Validation errors', { errors: parseError.errors }, requestId);
        throw new Error('AI generated invalid insights format');
      }
      throw new Error('Failed to parse AI response');
    }

    // Store insights back to database
    const { error: updateError } = await supabase
      .from('coach_assessments')
      .update({ ai_insights: insights })
      .eq('id', assessmentId);

    checkpoint(perfTimer, 'db_updated');

    if (updateError) {
      logError('Failed to store insights', updateError, requestId);
      logPerformance(perfTimer, 'generate-coach-insights:update_failed');
      throw updateError;
    }

    logInfo('Insights generated successfully', { assessmentId }, requestId);
    logPerformance(perfTimer, 'generate-coach-insights:success', { 
      insightsGenerated: true,
      actionableSteps: insights.actionable_steps.length 
    });
    
    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId } }
    );
  } catch (error: any) {
    logError('Function error', error, requestId);
    logPerformance(perfTimer, 'generate-coach-insights:error');
    return new Response(
      JSON.stringify({ error: 'An error occurred generating insights. Please try again.' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'x-request-id': requestId } 
      }
    );
  }
});
