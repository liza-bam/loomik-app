import { useEffect, useRef } from 'react';
import { simulationController, generateHistoricalActivities, CRITICAL_EVENT_TYPES, type SimulatedActivity, type ActivityType } from '@/lib/simulation/simulationEngine';
import { useActivityStore } from '@/stores/activityStore';
import { useSignalsStore, type CriticalEventCategory } from '@/stores/signalsStore';
import { deals, getDealById, getStakeholderById, getCompanyById } from '@/data/dealData';

/**
 * Global component that initializes and runs the simulation.
 * Place this at the App root to enable real-time activity generation.
 */
export function SimulationInitializer() {
  const hasInitialized = useRef(false);
  const { 
    addActivity, 
    addActivities, 
    isSimulationRunning, 
    setSimulationRunning 
  } = useActivityStore();
  const { addSignal } = useSignalsStore();

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Initialize historical data on first mount
    const allHistoricalActivities: SimulatedActivity[] = [];
    deals.forEach(deal => {
      const activities = generateHistoricalActivities(deal, 15);
      allHistoricalActivities.push(...activities);
    });
    addActivities(allHistoricalActivities);
    
    // Auto-start simulation after a short delay
    const timer = setTimeout(() => {
      if (!isSimulationRunning) {
        setSimulationRunning(true);
        simulationController.start((activity) => {
          addActivity(activity);
          processActivityForSignals(activity, addSignal);
        }, 30000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This component doesn't render anything visible
  return null;
}

// Helper to process activity for signals without hooks
function processActivityForSignals(
  activity: SimulatedActivity, 
  addSignal: ReturnType<typeof useSignalsStore.getState>['addSignal']
) {
  const deal = getDealById(activity.dealId);
  const stakeholder = activity.stakeholderId ? getStakeholderById(activity.stakeholderId) : undefined;
  
  if (!deal) return;

  // Check if this is a critical event
  const isCriticalEvent = CRITICAL_EVENT_TYPES.includes(activity.type);
  
  // Critical events always create signals, regular events have 25% chance
  const shouldCreateSignal = isCriticalEvent || Math.random() < 0.25;
  
  if (shouldCreateSignal) {
    const isRisk = activity.sentiment === 'negative' || 
      ['competitor_mentioned', 'objection_raised', 'timeline_discussed', 'stakeholder_departed', 'budget_frozen', 'deal_blocked'].includes(activity.type);
    
    // Map activity types to the new stakeholder metrics
    const metricImpact = getMetricImpact(activity.type, activity.sentiment);
    
    // Map activity type to critical event category
    const eventCategory = getCriticalEventCategory(activity.type);
    
    const signalData = {
      type: isRisk ? 'risk' as const : 'signal' as const,
      name: getSignalName(activity.type, isRisk),
      trigger: activity.description,
      evidence: generateEvidence(activity.type, metricImpact),
      dealId: deal.id,
      dealName: getCompanyById(deal.companyId)?.name || "Unknown",
      stakeholder: stakeholder ? {
        id: stakeholder.id,
        name: stakeholder.name,
        role: stakeholder.role,
        avatar: stakeholder.avatar
      } : undefined,
      priority: isCriticalEvent ? 'high' as const : determinePriority(activity, deal) as 'high' | 'medium' | 'low',
      sentiment: activity.sentiment,
      confidence: isCriticalEvent ? 90 + Math.floor(Math.random() * 8) : 70 + Math.floor(Math.random() * 25),
      suggestedAction: generateSuggestedAction(activity.type, stakeholder?.name, metricImpact),
      channel: isCriticalEvent ? getCriticalEventChannel(activity.type) : `${activity.source.charAt(0).toUpperCase() + activity.source.slice(1)} Analysis`,
      isUrgent: isRisk && (isCriticalEvent || determinePriority(activity, deal) === 'high'),
      // Critical event fields
      severity: isCriticalEvent ? 'critical' as const : 'normal' as const,
      eventCategory: eventCategory,
    };

    addSignal(signalData);
  }
}

// Map activity type to critical event category
function getCriticalEventCategory(activityType: string): CriticalEventCategory | undefined {
  const categoryMap: Record<string, CriticalEventCategory> = {
    stakeholder_departed: 'stakeholder_departure',
    stakeholder_hired: 'stakeholder_arrival',
    budget_signed: 'budget_approved',
    budget_frozen: 'budget_frozen',
    contract_executed: 'contract_signed',
    deal_blocked: 'deal_blocked',
  };
  return categoryMap[activityType];
}

// Get channel for critical events
function getCriticalEventChannel(activityType: string): string {
  const channelMap: Record<string, string> = {
    stakeholder_departed: 'LinkedIn + Email',
    stakeholder_hired: 'LinkedIn + News',
    budget_signed: 'Email + Finance System',
    budget_frozen: 'Email + CRM Notes',
    contract_executed: 'Document + CRM',
    deal_blocked: 'Email + CRM Notes',
  };
  return channelMap[activityType] || 'Multi-source Analysis';
}

// Map activity types to stakeholder metric impacts (new 3-metric system)
function getMetricImpact(activityType: string, sentiment?: string): { metric: string; direction: 'up' | 'down' } | null {
  const impactMap: Record<string, { metric: string; direction: 'up' | 'down' }> = {
    // Capability impacts (role coverage and engagement)
    stakeholder_added: { metric: 'capability', direction: 'up' },
    meeting_scheduled: { metric: 'capability', direction: 'up' },
    executive_engagement: { metric: 'capability', direction: 'up' },
    
    // Message Fit impacts (shared understanding)
    email_received: { metric: 'messageFit', direction: sentiment === 'positive' ? 'up' : 'down' },
    document_viewed: { metric: 'messageFit', direction: 'up' },
    document_shared: { metric: 'messageFit', direction: 'up' },
    meeting_completed: { metric: 'messageFit', direction: 'up' },
    
    // Value Translation impacts (ROI articulation)
    budget_mentioned: { metric: 'valueTranslation', direction: 'up' },
    champion_activity: { metric: 'valueTranslation', direction: 'up' },
    objection_raised: { metric: 'valueTranslation', direction: 'down' },
    competitor_mentioned: { metric: 'valueTranslation', direction: 'down' },
    timeline_discussed: { metric: 'valueTranslation', direction: sentiment === 'positive' ? 'up' : 'down' },
  };
  
  return impactMap[activityType] || null;
}

function getSignalName(activityType: string, isRisk: boolean): string {
  // Critical event names
  const criticalNames: Record<string, string> = {
    stakeholder_departed: 'Champion Left Company',
    stakeholder_hired: 'New Executive Appointed',
    budget_signed: 'Budget Formally Approved',
    budget_frozen: 'Budget Freeze Announced',
    contract_executed: 'Contract Signed',
    deal_blocked: 'Deal Put On Hold',
  };
  
  if (criticalNames[activityType]) {
    return criticalNames[activityType];
  }
  
  const names: Record<string, string> = {
    email_received: isRisk ? 'Response Delay' : 'Active Engagement',
    email_sent: 'Outreach Activity',
    meeting_scheduled: 'Capability Expansion',
    meeting_completed: 'Message Fit Progress',
    document_shared: isRisk ? 'Competitive Intel' : 'Message Fit Progress',
    document_viewed: 'Content Engagement',
    call_completed: 'Value Translation Progress',
    budget_mentioned: 'Value Translation Signal',
    competitor_mentioned: 'Value Translation Risk',
    timeline_discussed: isRisk ? 'Timeline Concern' : 'Timeline Progress',
    objection_raised: 'Value Translation Risk',
    champion_activity: 'Champion Momentum',
    executive_engagement: 'Capability Boost',
    stakeholder_added: 'Capability Expansion',
  };
  return names[activityType] || 'Activity Detected';
}

function generateEvidence(activityType: string, metricImpact: ReturnType<typeof getMetricImpact>): string {
  if (metricImpact) {
    const metricLabels: Record<string, string> = {
      capability: 'Capability',
      messageFit: 'Message Fit',
      valueTranslation: 'Value Translation'
    };
    const direction = metricImpact.direction === 'up' ? 'improving' : 'declining';
    return `${metricLabels[metricImpact.metric]} ${direction} based on ${activityType.replace(/_/g, ' ')} activity`;
  }
  
  const evidenceTemplates: Record<string, string[]> = {
    email_received: ['Email response patterns analyzed', 'Communication frequency compared'],
    competitor_mentioned: ['Competitor name detected in communications', 'Pricing comparison identified'],
    budget_mentioned: ['Budget allocation keywords detected', 'Spending discussions identified'],
    timeline_discussed: ['Timeline concerns raised', 'Deadline adjustments discussed'],
    objection_raised: ['Concern keywords detected', 'Hesitation patterns identified'],
    champion_activity: ['Meeting notes show advocacy', 'Materials shared with team'],
  };
  const templates = evidenceTemplates[activityType] || ['Activity pattern analyzed'];
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSuggestedAction(activityType: string, stakeholderName?: string, metricImpact?: ReturnType<typeof getMetricImpact>): string {
  const target = stakeholderName || 'key stakeholder';
  
  if (metricImpact?.direction === 'down') {
    const recoveryActions: Record<string, string> = {
      capability: `Expand stakeholder coverage and engagement`,
      messageFit: `Clarify value proposition with ${target}`,
      valueTranslation: `Re-engage decision makers with updated ROI`,
    };
    return recoveryActions[metricImpact.metric] || `Follow up with ${target}`;
  }
  
  const actions: Record<string, string> = {
    competitor_mentioned: `Prepare competitive differentiation for ${target}`,
    budget_mentioned: `Follow up with ${target} on budget timeline`,
    timeline_discussed: `Address timeline concerns with implementation plan`,
    objection_raised: `Schedule call with ${target} to address concerns`,
    champion_activity: `Support ${target} with additional resources`,
    executive_engagement: `Prepare executive briefing`,
  };
  return actions[activityType] || `Follow up with ${target}`;
}

function determinePriority(activity: SimulatedActivity, deal: any): string {
  if (deal.hasRisk && activity.sentiment === 'negative') return 'high';
  if (['competitor_mentioned', 'objection_raised'].includes(activity.type)) return 'high';
  if (activity.type === 'executive_engagement') return 'high';
  if (deal.valueNumeric > 1000000 && activity.sentiment === 'negative') return 'high';
  if (['budget_mentioned', 'timeline_discussed'].includes(activity.type)) return 'medium';
  return 'low';
}
