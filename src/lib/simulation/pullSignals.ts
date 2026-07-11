import { simulationController, CRITICAL_EVENT_TYPES } from './simulationEngine';
import { useActivityStore } from '@/stores/activityStore';
import { useSignalsStore, type CriticalEventCategory } from '@/stores/signalsStore';
import { deals, getStakeholderById, getCompanyById } from '@/data/dealData';

// Helper functions
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

function generateEvidence(activityType: string): string {
  const evidenceTemplates: Record<string, string[]> = {
    email_received: ['Email response patterns analyzed', 'Communication frequency compared to baseline'],
    competitor_mentioned: ['Competitor name detected in communications', 'Pricing comparison request identified'],
    budget_mentioned: ['Budget allocation keywords detected', 'Q2/Q3 spending discussions identified'],
    timeline_discussed: ['Implementation timeline concerns raised', 'Deadline adjustments discussed'],
    objection_raised: ['Concern keywords detected', 'Hesitation patterns identified'],
    champion_activity: ['Internal meeting notes show advocacy', 'Materials shared with team members'],
  };
  const templates = evidenceTemplates[activityType] || ['Activity pattern analyzed from data sources'];
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

function determinePriority(activityType: string, sentiment: string, hasRisk: boolean, valueNumeric: number): 'high' | 'medium' | 'low' {
  // Critical events are always high priority
  if (CRITICAL_EVENT_TYPES.includes(activityType as any)) return 'high';
  if (hasRisk && sentiment === 'negative') return 'high';
  if (['competitor_mentioned', 'objection_raised'].includes(activityType)) return 'high';
  if (activityType === 'executive_engagement') return 'high';
  if (valueNumeric > 1000000 && sentiment === 'negative') return 'high';
  if (['budget_mentioned', 'timeline_discussed'].includes(activityType)) return 'medium';
  return 'low';
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

/**
 * Pull signals manually - can be called from anywhere without hooks
 */
export function executePullSignals(): { activities: number; signals: number } {
  const numPulls = 2 + Math.floor(Math.random() * 3); // 2-4 activities
  const randomDeals = [...deals].sort(() => Math.random() - 0.5).slice(0, numPulls);
  
  let signalsGenerated = 0;
  
  // Get store actions directly (not via hooks)
  const addActivity = useActivityStore.getState().addActivity;
  const addSignal = useSignalsStore.getState().addSignal;

  randomDeals.forEach((deal) => {
    const activity = simulationController.triggerActivity(deal.id);
    if (activity) {
      addActivity(activity);
      
      // Check if this is a critical event
      const isCriticalEvent = CRITICAL_EVENT_TYPES.includes(activity.type);
      
      // Critical events always create signals, regular events have 50% chance during manual pull
      const shouldCreateSignal = isCriticalEvent || Math.random() < 0.5;
      if (shouldCreateSignal) {
        signalsGenerated++;
        const stakeholder = activity.stakeholderId ? getStakeholderById(activity.stakeholderId) : undefined;
        
        const isRisk = activity.sentiment === 'negative' || 
          ['competitor_mentioned', 'objection_raised', 'timeline_discussed', 'stakeholder_departed', 'budget_frozen', 'deal_blocked'].includes(activity.type);
        
        const priority = determinePriority(activity.type, activity.sentiment || 'neutral', deal.hasRisk, deal.valueNumeric);
        const eventCategory = getCriticalEventCategory(activity.type);
        
        const signalData = {
          type: isRisk ? 'risk' as const : 'signal' as const,
          name: getSignalName(activity.type, isRisk),
          trigger: activity.description,
          evidence: generateEvidence(activity.type),
          dealId: deal.id,
          dealName: getCompanyById(deal.companyId)?.name || deal.name,
          stakeholder: stakeholder ? {
            id: stakeholder.id,
            name: stakeholder.name,
            role: stakeholder.role,
            avatar: stakeholder.avatar
          } : undefined,
          priority,
          sentiment: activity.sentiment,
          confidence: isCriticalEvent ? 90 + Math.floor(Math.random() * 8) : 70 + Math.floor(Math.random() * 25),
          suggestedAction: generateSuggestedAction(activity.type, stakeholder?.name),
          channel: isCriticalEvent ? getCriticalEventChannel(activity.type) : `${activity.source.charAt(0).toUpperCase() + activity.source.slice(1)} Analysis`,
          isUrgent: isRisk && priority === 'high',
          // Critical event fields
          severity: isCriticalEvent ? 'critical' as const : 'normal' as const,
          eventCategory: eventCategory,
        };

        addSignal(signalData);
      }
    }
  });

  return { activities: numPulls, signals: signalsGenerated };
}
