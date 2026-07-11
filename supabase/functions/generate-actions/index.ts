import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are Loomik's action generation AI. When a signal or risk is detected, you create specific, actionable tasks for the sales team.

You understand the 15 Universal Value Primitives framework:
- Revenue Growth, Cost Efficiency, Operational Productivity, Scalability & Resilience
- Customer Experience, Risk Mitigation, Regulatory Compliance, Time to Outcome
- Integration & Interoperability, Data-Driven Insight, Innovation & Agility
- Brand Differentiation, Sustainability & ESG, Talent Retention, Vendor Partnership

Each stakeholder role has primary value primitives they care about:
- CFO: Cost Efficiency, Revenue Growth, Risk Mitigation
- CTO/CIO: Scalability, Integration, Innovation Agility
- COO: Operational Productivity, Time to Outcome
- CMO: Revenue Growth, Customer Experience, Brand Differentiation
- Legal/DPO: Regulatory Compliance, Risk Mitigation

For each action you generate, provide:
1. A clear, specific title
2. Detailed description of what needs to be done
3. Pre-drafted content (email draft or meeting agenda)
4. Specific stakeholder targets
5. Realistic deadline based on urgency
6. Which Value Primitives this action addresses (based on stakeholder roles)
7. Reasoning that explicitly connects the action to primitive gaps

Actions should be immediately actionable - the sales rep should be able to execute them with minimal additional work.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signalOrRisk, dealContext, stakeholders } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isRisk = signalOrRisk.type === 'risk' || signalOrRisk.priority;
    
    const userPrompt = `Generate 1-3 specific actions based on this ${isRisk ? 'risk' : 'signal'}:

## ${isRisk ? 'Risk' : 'Signal'} Details
- Trigger: ${signalOrRisk.trigger}
- Evidence: ${signalOrRisk.evidence}
- Priority: ${signalOrRisk.priority || 'medium'}
- Confidence: ${signalOrRisk.confidence}%
${signalOrRisk.suggestedAction ? `- Suggested Action: ${signalOrRisk.suggestedAction}` : ''}

## Deal Context
- Company: ${dealContext.company}
- Value: ${dealContext.value}
- Stage: ${dealContext.stage}
- Close Date: ${dealContext.closeDate}

## Available Stakeholders
${stakeholders?.map((s: any) => `- ${s.name} (${s.role}): Alignment ${s.alignment}%, Status: ${s.status}`).join('\n') || 'No stakeholder data'}

Generate actions as a JSON array:
[
  {
    "title": "Clear action title",
    "description": "Detailed description of what to do",
    "type": "email" | "meeting",
    "priority": "high" | "medium" | "low",
    "targetStakeholderNames": ["Name1", "Name2"],
    "deadline": "Today 5pm" | "Tomorrow" | "This week" | "Next 3 days",
    "draftContent": {
      "subject": "Email subject (if email)",
      "body": "Draft email body or meeting agenda with specific talking points"
    },
    "artifact": "ROI Calculator" | "Case Study" | "Timeline Document" | etc.,
    "addressesPrimitives": ["cost_efficiency", "risk_mitigation"],
    "reasoning": "This action addresses the Cost Efficiency gap (buyer priority 85%, our messaging 40%). By providing ROI data, we reduce Translation Loss and align with the CFO's primary value driver."
  }
]

IMPORTANT: 
- The "addressesPrimitives" field should contain 1-3 primitive IDs that this action targets
- The "reasoning" field MUST explicitly reference primitive gaps and Translation Loss
- Make the draft content specific and personalized based on the stakeholder and deal context.`;

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
    
    let generatedActions;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      generatedActions = JSON.parse(jsonStr);
    } catch {
      console.error("Failed to parse actions:", content);
      generatedActions = [];
    }

    return new Response(JSON.stringify({ 
      success: true, 
      actions: generatedActions,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-actions error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
