import { useState, useCallback } from 'react';
import { getDealById, getStakeholdersForDeal, getCompanyById, type Stakeholder } from '@/data/dealData';
import { useToast } from '@/hooks/use-toast';

interface DealAnalysis {
  riskAssessment: Array<{
    risk: string;
    severity: 'high' | 'medium' | 'low';
    evidence: string;
    mitigation: string;
  }>;
  updatedWinProbability: {
    value: number;
    change: number;
    reasoning: string;
  };
  stakeholderInsights: Array<{
    stakeholderId: number;
    name: string;
    insight: string;
    recommendedApproach: string;
  }>;
  recommendedActions: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    type: 'email' | 'meeting';
    targetStakeholder: string;
    deadline: string;
  }>;
  competitiveInsights: string;
  talkingPoints: string[];
}

// Deterministic pick from a list based on the deal id — same deal always gets
// the same "analysis" so results feel stable across opens.
const pickFor = <T,>(dealId: number, items: T[], offset = 0): T =>
  items[(dealId + offset) % items.length];

const RISK_TEMPLATES: Array<Omit<DealAnalysis['riskAssessment'][number], never>> = [
  {
    risk: 'Champion coverage is thin',
    severity: 'high',
    evidence: 'Only one advocate has attended the last three working sessions.',
    mitigation: 'Nominate a second champion in the finance org and share the ROI model with them directly.',
  },
  {
    risk: 'Budget signal has softened',
    severity: 'medium',
    evidence: 'Two recent messages reference "recalibrating" spend for the next quarter.',
    mitigation: 'Reframe the pilot as a cost-avoidance investment; offer a phased rollout to reduce upfront exposure.',
  },
  {
    risk: 'Procurement engagement is late',
    severity: 'medium',
    evidence: 'Legal and procurement have not been looped in despite technical approval.',
    mitigation: 'Send a redlined MSA proactively this week to shorten the paper cycle.',
  },
  {
    risk: 'Silent decision-maker',
    severity: 'low',
    evidence: 'CTO has not responded to the last two touches.',
    mitigation: 'Route a peer-introduction from the current champion; keep the ask short.',
  },
];

const STAKEHOLDER_INSIGHTS = [
  {
    insight: 'Strongly aligned on outcomes; motivated by team-level KPIs.',
    recommendedApproach: 'Share a concise wins summary they can forward to their VP.',
  },
  {
    insight: 'Skeptical about implementation timeline based on past vendor experience.',
    recommendedApproach: 'Walk through the 30-day milestone plan and offer a reference call.',
  },
  {
    insight: 'Neutral — hasn\'t seen the ROI story in their own words yet.',
    recommendedApproach: 'Send the ROI one-pager tailored to their function (finance, ops, or eng).',
  },
  {
    insight: 'Champion-level advocate; will defend the deal internally.',
    recommendedApproach: 'Equip with rebuttal notes for the top 3 objections you expect.',
  },
];

const ACTION_TEMPLATES: Array<Omit<DealAnalysis['recommendedActions'][number], 'targetStakeholder' | 'deadline'>> = [
  {
    title: 'Send tailored ROI summary',
    description: 'One-page ROI story tuned to their industry — payback in months, not features.',
    priority: 'high',
    type: 'email',
  },
  {
    title: 'Book multi-threading working session',
    description: '45-minute session with champion + two neutral stakeholders to review the pilot.',
    priority: 'high',
    type: 'meeting',
  },
  {
    title: 'Follow up on paperwork',
    description: 'Nudge procurement/legal to keep the MSA moving without pressuring the buyer.',
    priority: 'medium',
    type: 'email',
  },
];

const COMPETITIVE_LINES = [
  'Your incumbent is strong on pricing but weak on integration depth — lean into the migration story.',
  'A newer competitor is aggressive on discounts; frame this as risk-adjusted total cost, not sticker price.',
  'No clear rival evaluated in parallel — the real competition is "do nothing." Speed matters more than positioning.',
];

const TALKING_POINT_POOL = [
  'The pilot showed a 32% reduction in cycle time — quote the number in every touch.',
  'Two peer companies in their space closed in Q3 and are already citing results.',
  'Integration risk is the top objection from finance — lead with the 3-week implementation timeline.',
  'The champion needs internal air-cover — offer to co-write the board update.',
  'Timing pressure: their fiscal year ends in 60 days; tie the ask to that runway.',
];

const daysFromNow = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const buildAnalysis = (
  dealId: number,
  stakeholders: Stakeholder[],
  currentWinProbability: number,
): DealAnalysis => {
  const riskAssessment = [
    pickFor(dealId, RISK_TEMPLATES, 0),
    pickFor(dealId, RISK_TEMPLATES, 1),
    pickFor(dealId, RISK_TEMPLATES, 2),
  ];

  const change = ((dealId * 7) % 11) - 4;
  const updatedWinProbability = {
    value: Math.max(5, Math.min(95, currentWinProbability + change)),
    change,
    reasoning:
      change >= 0
        ? 'Multi-threading is broadening advocacy and the pilot results resonate. Momentum is intact.'
        : 'A silent decision-maker and slowing procurement momentum weigh on the forecast this week.',
  };

  const stakeholderInsights = stakeholders.slice(0, 4).map((s, i) => {
    const template = pickFor(dealId + i, STAKEHOLDER_INSIGHTS);
    return {
      stakeholderId: s.id,
      name: s.name,
      insight: template.insight,
      recommendedApproach: template.recommendedApproach,
    };
  });

  const primaryStakeholder = stakeholders[0]?.name ?? 'Primary champion';
  const secondaryStakeholder = stakeholders[1]?.name ?? primaryStakeholder;

  const recommendedActions: DealAnalysis['recommendedActions'] = [
    { ...ACTION_TEMPLATES[0], targetStakeholder: primaryStakeholder, deadline: daysFromNow(2) },
    { ...ACTION_TEMPLATES[1], targetStakeholder: secondaryStakeholder, deadline: daysFromNow(7) },
    { ...ACTION_TEMPLATES[2], targetStakeholder: primaryStakeholder, deadline: daysFromNow(10) },
  ];

  const competitiveInsights = pickFor(dealId, COMPETITIVE_LINES);

  const talkingPoints = [
    pickFor(dealId, TALKING_POINT_POOL, 0),
    pickFor(dealId, TALKING_POINT_POOL, 1),
    pickFor(dealId, TALKING_POINT_POOL, 2),
    pickFor(dealId, TALKING_POINT_POOL, 3),
  ];

  return {
    riskAssessment,
    updatedWinProbability,
    stakeholderInsights,
    recommendedActions,
    competitiveInsights,
    talkingPoints,
  };
};

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeDeal = useCallback(async (dealId: number) => {
    const deal = getDealById(dealId);
    if (!deal) {
      setError('Deal not found');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const stakeholders = getStakeholdersForDeal(dealId);
      // Small delay so the loading state is visible and feels real.
      await new Promise(resolve => setTimeout(resolve, 900));

      const result = buildAnalysis(dealId, stakeholders, deal.winProbability);
      setAnalysis(result);
      toast({
        title: 'Analysis Complete',
        description: `${getCompanyById(deal.companyId)?.name || deal.name} deal analyzed successfully`,
      });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    analysis,
    error,
    analyzeDeal,
    clearAnalysis,
  };
}
