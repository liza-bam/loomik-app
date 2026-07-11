import { useState, useCallback } from 'react';
import { getDealById, getStakeholdersForDeal, getCompanyById, type Deal, type Stakeholder } from '@/data/dealData';
import { useActivityStore } from '@/stores/activityStore';
import { useSignalsStore } from '@/stores/signalsStore';
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

const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-deal`;

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DealAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { getActivitiesByDeal } = useActivityStore();
  const { getSignalsByDeal } = useSignalsStore();

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
      const activities = getActivitiesByDeal(dealId).slice(0, 20);
      const signals = getSignalsByDeal(dealId).slice(0, 10);

      const response = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          deal: {
            company: getCompanyById(deal.companyId)?.name || deal.name,
            value: deal.value,
            valueNumeric: deal.valueNumeric,
            stage: deal.stage,
            winProbability: deal.winProbability,
            alignment: deal.alignment,
            consensus: deal.consensus,
            closeDate: deal.closeDate,
            dealStartDate: deal.dealStartDate,
            hasRisk: deal.hasRisk,
          },
          stakeholders: stakeholders.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role,
            status: s.status,
            alignment: s.alignment,
            priority: s.priority,
            sentiment: s.sentiment,
            lastInteraction: s.lastInteraction,
          })),
          activities: activities.map(a => ({
            type: a.type,
            description: a.description,
            timestamp: a.timestamp,
            source: a.source,
            sentiment: a.sentiment,
          })),
          recentSignals: signals.map(s => ({
            type: s.type,
            trigger: s.trigger,
            confidence: s.confidence,
            priority: s.priority,
          })),
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Usage limit reached. Please add credits.');
        }
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        toast({
          title: "Analysis Complete",
          description: `${getCompanyById(deal.companyId)?.name || deal.name} deal analyzed successfully`,
        });
        return data.analysis;
      } else {
        throw new Error(data.error || 'Analysis failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [getActivitiesByDeal, getSignalsByDeal, toast]);

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
