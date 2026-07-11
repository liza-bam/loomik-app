import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are Loomik's signal detection AI. You analyze sales activities and determine if they represent significant signals or risks that warrant attention.

A SIGNAL is a positive or neutral indicator that could impact deal progression (e.g., increased engagement, budget discussions, positive sentiment).
A RISK is a negative indicator that could jeopardize the deal (e.g., stakeholder disengagement, competitor mentions, delayed responses).

Analyze the activity and return a JSON response indicating whether this is noteworthy and what type of signal/risk it represents.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activity, dealContext, stakeholderContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Analyze this sales activity and determine if it's a noteworthy signal or risk:

## Activity Details
- Type: ${activity.type}
- Description: ${activity.description}
- Timestamp: ${activity.timestamp}
- Source: ${activity.source}
${activity.content ? `- Content/Details: ${activity.content}` : ''}

## Deal Context
- Company: ${dealContext.company}
- Value: ${dealContext.value}
- Stage: ${dealContext.stage}
- Current Win Probability: ${dealContext.winProbability}%

## Stakeholder Context
${stakeholderContext ? `- Name: ${stakeholderContext.name}
- Role: ${stakeholderContext.role}
- Current Alignment: ${stakeholderContext.alignment}%
- Status: ${stakeholderContext.status}` : 'No specific stakeholder'}

Determine if this activity is significant. Return a JSON object:
{
  "isSignificant": true/false,
  "type": "signal" | "risk" | null,
  "category": "engagement" | "budget" | "competitor" | "sentiment" | "timeline" | "stakeholder" | null,
  "priority": "high" | "medium" | "low" | null,
  "trigger": "one-line description of what was detected",
  "evidence": "detailed explanation of why this is significant",
  "confidence": 0-100,
  "suggestedAction": "what should the sales rep do about this",
  "sentiment": "positive" | "neutral" | "negative" | null,
  "impactOnProbability": -10 to +10 (estimated change to win probability)
}

If not significant, return: { "isSignificant": false }`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let signalAnalysis;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      signalAnalysis = JSON.parse(jsonStr);
    } catch {
      signalAnalysis = { isSignificant: false };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      result: signalAnalysis,
      processedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-signal error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
