import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { scores, moduleContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a concise summary of domain scores
    const domainSummary = scores
      ? [
          scores.leadership_dna_mean != null &&
            `Leadership DNA: ${scores.leadership_dna_mean.toFixed(1)}/5`,
          scores.accountability_mean != null &&
            `Accountability: ${scores.accountability_mean.toFixed(1)}/5`,
          scores.excellence_mean != null &&
            `Excellence: ${scores.excellence_mean.toFixed(1)}/5`,
          scores.discipline_mean != null &&
            `Discipline: ${scores.discipline_mean.toFixed(1)}/5`,
          scores.belonging_mean != null &&
            `Belonging: ${scores.belonging_mean.toFixed(1)}/5`,
        ]
          .filter(Boolean)
          .join(", ")
      : null;

    const systemPrompt = `You are a youth leadership development coach for student-athletes. 
You help middle school and high school athletes identify specific, actionable behaviors they should improve based on their leadership assessment scores (FLDI — Flyte Leadership DNA Index).

Each domain is scored 1-5. Lower scores indicate areas needing the most growth.

Guidelines:
- Suggest exactly 5 specific, concrete behaviors (not vague goals)
- Each suggestion should be 1 short sentence, action-oriented, starting with a verb
- Focus on the 1-2 lowest-scoring domains
- Make suggestions age-appropriate and relatable to student-athletes
- Frame positively (what TO do, not what to stop)
- Keep language simple and motivating
- Return ONLY a JSON array of 5 strings, nothing else

Example output:
["Greet every teammate by name before practice starts","Ask the coach one question after each drill","Write down one thing you're grateful for after every game","Hold yourself to the same standard whether winning or losing","Volunteer to demonstrate a drill even when you're unsure"]`;

    const userPrompt = domainSummary
      ? `Based on these FLDI assessment scores, suggest 5 specific behaviors to improve:\n${domainSummary}\n\nModule context: ${moduleContext || "Identity & Core Values"}`
      : `The student hasn't completed an assessment yet. Suggest 5 general leadership behaviors a student-athlete should practice daily.\n\nModule context: ${moduleContext || "Identity & Core Values"}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse the JSON array from the response
    let suggestions: string[];
    try {
      // Handle potential markdown code fences
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      suggestions = [
        "Show up 5 minutes early to every practice",
        "Encourage a teammate who made a mistake",
        "Ask your coach for one piece of feedback after practice",
        "Write down your top goal before each game",
        "Hold yourself accountable before pointing at others",
      ];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-behaviors error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
