import { useEffect, useCallback, useRef } from 'react';
import { simulationController, generateHistoricalActivities, type SimulatedActivity } from '@/lib/simulation/simulationEngine';
import { useActivityStore } from '@/stores/activityStore';
import { useSignalsStore } from '@/stores/signalsStore';
import { deals, stakeholders, getDealById, getStakeholderById, getCompanyById } from '@/data/dealData';
import { useToast } from '@/hooks/use-toast';

const SPEED_INTERVALS = {
  slow: 60000,    // 1 minute
  normal: 30000,  // 30 seconds
  fast: 10000,    // 10 seconds
};

export function useSimulation() {
  const { toast } = useToast();
  const { 
    addActivity, 
    addActivities,
    isSimulationRunning, 
    setSimulationRunning,
    simulationSpeed,
    setSimulationSpeed 
  } = useActivityStore();
  
  const { addSignal } = useSignalsStore();
  const isInitialized = useRef(false);

  // Process activity through AI signal detection (simulated for now to avoid too many API calls)
  const processActivityForSignals = useCallback(async (activity: SimulatedActivity) => {
    const deal = getDealById(activity.dealId);
    const stakeholder = activity.stakeholderId ? getStakeholderById(activity.stakeholderId) : undefined;
    
    if (!deal) return;

    // Simulate signal detection locally (would normally call edge function)
    // This reduces API calls while still providing realistic behavior
    const shouldCreateSignal = Math.random() < 0.25; // 25% chance of creating a signal
    
    if (shouldCreateSignal) {
      const isRisk = activity.sentiment === 'negative' || 
        ['competitor_mentioned', 'objection_raised', 'timeline_discussed'].includes(activity.type);
      
      const signalData = {
        type: isRisk ? 'risk' as const : 'signal' as const,
        name: getSignalName(activity.type, isRisk),
        trigger: activity.description,
        evidence: generateEvidence(activity),
        dealId: deal.id,
        dealName: getCompanyById(deal.companyId)?.name || deal.name,
        stakeholder: stakeholder ? {
          id: stakeholder.id,
          name: stakeholder.name,
          role: stakeholder.role,
          avatar: stakeholder.avatar
        } : undefined,
        priority: determinePriority(activity, deal) as 'high' | 'medium' | 'low',
        sentiment: activity.sentiment,
        confidence: 70 + Math.floor(Math.random() * 25),
        suggestedAction: generateSuggestedAction(activity.type, stakeholder?.name),
        channel: `${activity.source.charAt(0).toUpperCase() + activity.source.slice(1)} Analysis`,
        isUrgent: isRisk && determinePriority(activity, deal) === 'high',
      };

      addSignal(signalData);
      
      // Show toast notification for high priority items
      if (signalData.priority === 'high') {
        toast({
          title: isRisk ? "🚨 Risk Detected" : "📊 Signal Detected",
          description: activity.description,
          variant: isRisk ? "destructive" : "default",
        });
      }
    }
  }, [addSignal, toast]);

  // Handle new activity
  const handleNewActivity = useCallback((activity: SimulatedActivity) => {
    addActivity(activity);
    processActivityForSignals(activity);
  }, [addActivity, processActivityForSignals]);

  // Start simulation
  const startSimulation = useCallback(() => {
    if (isSimulationRunning) return;
    
    setSimulationRunning(true);
    simulationController.start(handleNewActivity, SPEED_INTERVALS[simulationSpeed]);
  }, [isSimulationRunning, setSimulationRunning, handleNewActivity, simulationSpeed]);

  // Stop simulation
  const stopSimulation = useCallback(() => {
    setSimulationRunning(false);
    simulationController.stop();
  }, [setSimulationRunning]);

  // Change simulation speed
  const changeSpeed = useCallback((speed: 'slow' | 'normal' | 'fast') => {
    setSimulationSpeed(speed);
    simulationController.setInterval(SPEED_INTERVALS[speed]);
  }, [setSimulationSpeed]);

  // Initialize with historical data
  const initializeHistoricalData = useCallback(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const allHistoricalActivities: SimulatedActivity[] = [];
    deals.forEach(deal => {
      const activities = generateHistoricalActivities(deal, 15);
      allHistoricalActivities.push(...activities);
    });
    
    addActivities(allHistoricalActivities);
  }, [addActivities]);

  // Trigger a specific activity
  const triggerActivity = useCallback((dealId: number) => {
    const activity = simulationController.triggerActivity(dealId);
    if (activity) {
      handleNewActivity(activity);
    }
  }, [handleNewActivity]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      simulationController.stop();
    };
  }, []);

  return {
    isSimulationRunning,
    simulationSpeed,
    startSimulation,
    stopSimulation,
    changeSpeed,
    initializeHistoricalData,
    triggerActivity,
  };
}

// Helper functions
function getSignalName(activityType: string, isRisk: boolean): string {
  const names: Record<string, string> = {
    email_received: isRisk ? 'Response Delay' : 'Active Engagement',
    email_sent: 'Outreach Activity',
    meeting_scheduled: 'Meeting Confirmed',
    meeting_completed: 'Engagement Progress',
    document_shared: isRisk ? 'Competitive Intel' : 'Document Sharing',
    document_viewed: 'Content Engagement',
    call_completed: 'Call Progress',
    budget_mentioned: 'Budget Signal',
    competitor_mentioned: 'Competitive Pressure',
    timeline_discussed: isRisk ? 'Timeline Concern' : 'Timeline Progress',
    objection_raised: 'Objection Detected',
    champion_activity: 'Champion Momentum',
    executive_engagement: 'Executive Interest',
    stakeholder_added: 'Stakeholder Expansion',
  };
  return names[activityType] || 'Activity Detected';
}

function generateEvidence(activity: SimulatedActivity): string {
  const evidenceTemplates: Record<string, string[]> = {
    email_received: [
      'Email response time and engagement patterns analyzed',
      'Communication frequency compared to baseline',
    ],
    competitor_mentioned: [
      'Competitor name detected in email thread 3 times',
      'Pricing comparison request identified in message',
    ],
    budget_mentioned: [
      'Budget allocation keywords detected in communications',
      'Q2/Q3 spending discussions identified',
    ],
    timeline_discussed: [
      'Implementation timeline concerns raised in meeting notes',
      'Deadline adjustments discussed in recent communications',
    ],
    objection_raised: [
      'Concern keywords detected: pricing, complexity, timeline',
      'Hesitation patterns identified in stakeholder responses',
    ],
    champion_activity: [
      'Internal meeting notes show solution advocacy',
      'Stakeholder sharing materials with additional team members',
    ],
  };

  const templates = evidenceTemplates[activity.type] || ['Activity pattern analyzed from multiple data sources'];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSuggestedAction(activityType: string, stakeholderName?: string): string {
  const target = stakeholderName || 'key stakeholder';
  const actions: Record<string, string> = {
    competitor_mentioned: `Prepare competitive differentiation materials for ${target}`,
    budget_mentioned: `Follow up with ${target} to understand budget timeline`,
    timeline_discussed: `Address timeline concerns with detailed implementation plan`,
    objection_raised: `Schedule call with ${target} to address concerns directly`,
    champion_activity: `Support ${target} with additional resources for internal advocacy`,
    executive_engagement: `Prepare executive briefing for leadership meeting`,
  };
  return actions[activityType] || `Follow up with ${target} on recent activity`;
}

function determinePriority(activity: SimulatedActivity, deal: any): string {
  // High priority if: at-risk deal + negative sentiment, or competitor mentioned, or executive engagement
  if (deal.hasRisk && activity.sentiment === 'negative') return 'high';
  if (['competitor_mentioned', 'objection_raised'].includes(activity.type)) return 'high';
  if (activity.type === 'executive_engagement') return 'high';
  if (deal.valueNumeric > 1000000 && activity.sentiment === 'negative') return 'high';
  
  // Medium priority for budget/timeline discussions
  if (['budget_mentioned', 'timeline_discussed'].includes(activity.type)) return 'medium';
  
  return 'low';
}
