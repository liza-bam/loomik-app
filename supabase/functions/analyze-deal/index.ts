import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are Loomik, an AI-powered sales intelligence assistant. You analyze deal data, stakeholder engagement, and activity patterns to provide actionable insights for sales teams.

Your task is to analyze deal information and return a structured JSON response with:
1. Risk assessment (identified risks with severity and evidence)
2. Updated win probability with reasoning
3. Stakeholder insights (alignment changes, concerns, opportunities)
4. Recommended actions (specific, actionable next steps)
5. Competitive positioning insights
6. Key talking points for stakeholder conversations

Be specific, data-driven, and focus on actionable recommendations. Base your analysis on the patterns in the provided data.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deal, stakeholders, activities, recentSignals } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Analyze this sales deal and provide strategic insights:

## Deal Overview
- Company: ${deal.company}
- Value: ${deal.value}
- Stage: ${deal.stage}
- Current Win Probability: ${deal.winProbability}%
- Close Date: ${deal.closeDate}
- Alignment Score: ${deal.alignment}%
- Consensus Score: ${deal.consensus}%

## Stakeholders (${stakeholders?.length || 0} total)
${stakeholders?.map((s: any) => `- ${s.name} (${s.role}): Alignment ${s.alignment}%, Status: ${s.status}, Last contact: ${s.lastInteraction?.date || 'Unknown'}`).join('\n') || 'No stakeholder data'}

## Recent Activities (${activities?.length || 0} events)
${activities?.slice(0, 10).map((a: any) => `- [${a.type}] ${a.description} (${a.timestamp})`).join('\n') || 'No recent activities'}

## Recent Signals
${recentSignals?.map((s: any) => `- ${s.type}: ${s.trigger} (${s.confidence}% confidence)`).join('\n') || 'No recent signals'}

Provide your analysis as a JSON object with this exact structure:
{
  "riskAssessment": [
    { "risk": "description", "severity": "high|medium|low", "evidence": "what data supports this", "mitigation": "recommended action" }
  ],
  "updatedWinProbability": {
    "value": 75,
    "change": -3,
    "reasoning": "explanation of why"
  },
  "stakeholderInsights": [
    { "stakeholderId": 1, "name": "Name", "insight": "key observation", "recommendedApproach": "how to engage" }
  ],
  "recommendedActions": [
    { "title": "action title", "description": "detailed description", "priority": "high|medium|low", "type": "email|meeting", "targetStakeholder": "name", "deadline": "suggested timing" }
  ],
  "competitiveInsights": "analysis of competitive position",
  "talkingPoints": ["point 1", "point 2", "point 3"]
}`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Try to parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysis = {
        riskAssessment: [],
        updatedWinProbability: { value: deal.winProbability, change: 0, reasoning: "Unable to analyze" },
        stakeholderInsights: [],
        recommendedActions: [],
        competitiveInsights: "Analysis unavailable",
        talkingPoints: []
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      analyzedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-deal error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
