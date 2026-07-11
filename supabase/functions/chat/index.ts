import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are Loomik, an AI-powered sales intelligence assistant embedded in a sales dashboard. You help sales representatives understand their deals, prioritize actions, and develop winning strategies.

Key capabilities:
- Analyze deal health and stakeholder engagement
- Identify risks and opportunities
- Suggest specific actions and talking points
- Compare deals and prioritize focus areas
- Provide competitive intelligence insights

Communication style:
- Be concise and action-oriented
- Lead with the most important insight
- Use data to support recommendations
- Be specific about stakeholder names and deal details
- Suggest concrete next steps

Current context will be provided with each message including active deals, stakeholders, signals, and recent activities.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dealContext } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context message
    let contextMessage = "";
    if (dealContext) {
      contextMessage = `\n\n## Current Dashboard Context

### Active Deals (${dealContext.deals?.length || 0})
${dealContext.deals?.map((d: any) => `- ${d.company}: ${d.value} | Stage: ${d.stage} | Win: ${d.winProbability}% | Risk: ${d.hasRisk ? 'Yes' : 'No'}`).join('\n') || 'No deals loaded'}

### Recent Signals (${dealContext.signals?.length || 0})
${dealContext.signals?.slice(0, 5).map((s: any) => `- [${s.type}] ${s.trigger} (${s.dealName})`).join('\n') || 'No recent signals'}

### Active Risks (${dealContext.risks?.length || 0})
${dealContext.risks?.slice(0, 5).map((r: any) => `- [${r.priority}] ${r.name}: ${r.trigger} (${r.dealName})`).join('\n') || 'No active risks'}

### Top Priority Actions
${dealContext.actions?.slice(0, 5).map((a: any) => `- [${a.priority}] ${a.title} - ${a.dealName} (Due: ${a.deadline})`).join('\n') || 'No pending actions'}

Use this context to provide relevant, specific advice.`;
    }

    const enhancedSystemPrompt = systemPrompt + contextMessage;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages
        ],
        stream: true,
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

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("chat error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
