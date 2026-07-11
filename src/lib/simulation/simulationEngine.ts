// Simulation Engine - Generates realistic sales activity events
import { deals, stakeholders, getCompanyById, type Deal, type Stakeholder } from '@/data/dealData';

export type ActivityType = 
  | 'email_received' 
  | 'email_sent' 
  | 'meeting_scheduled' 
  | 'meeting_completed'
  | 'document_shared'
  | 'document_viewed'
  | 'call_completed'
  | 'stakeholder_added'
  | 'budget_mentioned'
  | 'competitor_mentioned'
  | 'timeline_discussed'
  | 'objection_raised'
  | 'champion_activity'
  | 'executive_engagement'
  // Critical events
  | 'stakeholder_departed'
  | 'stakeholder_hired'
  | 'budget_signed'
  | 'budget_frozen'
  | 'contract_executed'
  | 'deal_blocked';

export interface SimulatedActivity {
  id: string;
  type: ActivityType;
  description: string;
  dealId: number;
  stakeholderId?: number;
  timestamp: Date;
  source: 'email' | 'calendar' | 'crm' | 'document' | 'call';
  content?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  metadata?: Record<string, any>;
}

// Activity templates for realistic simulation
const activityTemplates: Record<ActivityType, { templates: string[], sources: SimulatedActivity['source'][], sentiments: SimulatedActivity['sentiment'][] }> = {
  email_received: {
    templates: [
      "Received email from {stakeholder} regarding project timeline",
      "{stakeholder} responded to your proposal with questions about pricing",
      "New email from {stakeholder}: Follow-up on last week's demo",
      "{stakeholder} forwarded your proposal to their team",
      "Email from {stakeholder} requesting additional case studies"
    ],
    sources: ['email'],
    sentiments: ['positive', 'neutral', 'neutral', 'positive', 'neutral']
  },
  email_sent: {
    templates: [
      "Sent ROI analysis to {stakeholder}",
      "Follow-up email sent to {stakeholder} regarding next steps",
      "Shared security documentation with {stakeholder}",
      "Sent meeting recap to {stakeholder}"
    ],
    sources: ['email'],
    sentiments: ['neutral', 'neutral', 'neutral', 'neutral']
  },
  meeting_scheduled: {
    templates: [
      "{stakeholder} accepted meeting invite for next week",
      "Demo scheduled with {stakeholder} and 3 additional team members",
      "Executive review meeting confirmed with {stakeholder}",
      "Technical deep-dive scheduled with {stakeholder}"
    ],
    sources: ['calendar'],
    sentiments: ['positive', 'positive', 'positive', 'positive']
  },
  meeting_completed: {
    templates: [
      "Completed discovery call with {stakeholder} - strong interest shown",
      "Demo with {stakeholder} went well, follow-up items identified",
      "Executive presentation with {stakeholder} - next steps agreed",
      "Technical review with {stakeholder} - minor concerns addressed"
    ],
    sources: ['calendar'],
    sentiments: ['positive', 'positive', 'positive', 'neutral']
  },
  document_shared: {
    templates: [
      "{stakeholder} shared internal requirements document",
      "Received RFP document from {stakeholder}",
      "{stakeholder} shared competitive analysis internally",
      "Budget approval document shared by {stakeholder}"
    ],
    sources: ['document'],
    sentiments: ['positive', 'neutral', 'negative', 'positive']
  },
  document_viewed: {
    templates: [
      "{stakeholder} viewed proposal (3 minutes spent)",
      "{stakeholder} downloaded case study PDF",
      "Pricing document opened by {stakeholder}",
      "{stakeholder} reviewed security documentation (12 minutes)"
    ],
    sources: ['document'],
    sentiments: ['positive', 'positive', 'neutral', 'positive']
  },
  call_completed: {
    templates: [
      "15-minute call with {stakeholder} - budget confirmed",
      "Quick sync with {stakeholder} about implementation timeline",
      "Call with {stakeholder} - introduced to IT Director"
    ],
    sources: ['call'],
    sentiments: ['positive', 'positive', 'positive']
  },
  budget_mentioned: {
    templates: [
      "{stakeholder} mentioned Q2 budget allocation in email",
      "Budget review meeting notes from {stakeholder}",
      "{stakeholder} confirmed budget approval path",
      "Finance team (via {stakeholder}) requesting cost breakdown"
    ],
    sources: ['email', 'crm'],
    sentiments: ['positive', 'neutral', 'positive', 'neutral']
  },
  competitor_mentioned: {
    templates: [
      "{stakeholder} mentioned evaluating alternative solutions",
      "Competitor pricing request forwarded by {stakeholder}",
      "{stakeholder} asked for comparison with {competitor}"
    ],
    sources: ['email', 'crm'],
    sentiments: ['negative', 'negative', 'neutral']
  },
  timeline_discussed: {
    templates: [
      "{stakeholder} requested accelerated implementation",
      "Implementation timeline concerns raised by {stakeholder}",
      "{stakeholder} confirmed target go-live date",
      "Delay requested by {stakeholder} due to internal projects"
    ],
    sources: ['email', 'calendar'],
    sentiments: ['positive', 'negative', 'positive', 'negative']
  },
  objection_raised: {
    templates: [
      "{stakeholder} raised concerns about integration complexity",
      "Pricing pushback from {stakeholder}",
      "{stakeholder} questioning ROI assumptions",
      "Security concerns raised by {stakeholder}"
    ],
    sources: ['email', 'call'],
    sentiments: ['negative', 'negative', 'negative', 'negative']
  },
  champion_activity: {
    templates: [
      "{stakeholder} presenting our solution at internal meeting",
      "{stakeholder} shared success metrics with leadership",
      "{stakeholder} requested executive sponsorship meeting",
      "{stakeholder} building internal business case"
    ],
    sources: ['crm', 'email'],
    sentiments: ['positive', 'positive', 'positive', 'positive']
  },
  executive_engagement: {
    templates: [
      "CEO office requested executive summary",
      "Board meeting discussion mentioned by {stakeholder}",
      "{stakeholder} escalated decision to C-suite",
      "Executive sponsor identified by {stakeholder}"
    ],
    sources: ['email', 'crm'],
    sentiments: ['positive', 'positive', 'neutral', 'positive']
  },
  stakeholder_added: {
    templates: [
      "New stakeholder {stakeholder} added to deal",
      "{stakeholder} introduced additional decision maker",
      "Procurement team member ({stakeholder}) joined evaluation"
    ],
    sources: ['crm'],
    sentiments: ['positive', 'neutral', 'neutral']
  },
  // Critical Events - Game Changers
  stakeholder_departed: {
    templates: [
      "{stakeholder} has left the company - LinkedIn profile updated",
      "{stakeholder} resigned from their position - detected via company announcement",
      "Key contact {stakeholder} is no longer with the organization"
    ],
    sources: ['crm', 'email'],
    sentiments: ['negative', 'negative', 'negative']
  },
  stakeholder_hired: {
    templates: [
      "New executive {stakeholder} joined as decision maker",
      "{stakeholder} appointed as new leader - potential champion opportunity",
      "Leadership change: {stakeholder} now heading the initiative"
    ],
    sources: ['crm', 'email'],
    sentiments: ['positive', 'positive', 'positive']
  },
  budget_signed: {
    templates: [
      "{stakeholder} formally approved the budget allocation",
      "Finance committee signed off on budget - confirmed by {stakeholder}",
      "Budget formally approved by {stakeholder} - ready to proceed"
    ],
    sources: ['email', 'crm'],
    sentiments: ['positive', 'positive', 'positive']
  },
  budget_frozen: {
    templates: [
      "Company-wide budget freeze announced by {stakeholder}",
      "{stakeholder} informed that all discretionary spending is on hold",
      "Budget allocation suspended - confirmed by {stakeholder}"
    ],
    sources: ['email', 'crm'],
    sentiments: ['negative', 'negative', 'negative']
  },
  contract_executed: {
    templates: [
      "Contract signed by {stakeholder} - deal closed",
      "{stakeholder} executed the agreement - moving to implementation",
      "Legal approval obtained - {stakeholder} signed final documents"
    ],
    sources: ['document', 'crm'],
    sentiments: ['positive', 'positive', 'positive']
  },
  deal_blocked: {
    templates: [
      "{stakeholder} put the project on indefinite hold",
      "Initiative blocked by board decision - reported by {stakeholder}",
      "{stakeholder} informed that evaluation is paused until next fiscal year"
    ],
    sources: ['email', 'crm'],
    sentiments: ['negative', 'negative', 'negative']
  }
};

const competitors = ['CompetitorX', 'RivalTech', 'AlternaSoft', 'NextGen Solutions'];

// Critical event types for special handling
export const CRITICAL_EVENT_TYPES: ActivityType[] = [
  'stakeholder_departed',
  'stakeholder_hired', 
  'budget_signed',
  'budget_frozen',
  'contract_executed',
  'deal_blocked'
];

// Generate a random activity
export function generateActivity(deal?: Deal, stakeholder?: Stakeholder): SimulatedActivity {
  const targetDeal = deal || deals[Math.floor(Math.random() * deals.length)];
  const dealStakeholders = stakeholders.filter(s => s.dealId === targetDeal.id);
  const targetStakeholder = stakeholder || (dealStakeholders.length > 0 
    ? dealStakeholders[Math.floor(Math.random() * dealStakeholders.length)]
    : undefined);

  // Weight activity types based on deal stage and health
  const activityTypes = getWeightedActivityTypes(targetDeal);
  const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
  
  const template = activityTemplates[activityType];
  const templateIdx = Math.floor(Math.random() * template.templates.length);
  let description = template.templates[templateIdx];
  
  // Replace placeholders
  if (targetStakeholder) {
    description = description.replace('{stakeholder}', targetStakeholder.name);
  } else {
    description = description.replace('{stakeholder}', 'Unknown Contact');
  }
  description = description.replace('{competitor}', competitors[Math.floor(Math.random() * competitors.length)]);

  return {
    id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: activityType,
    description,
    dealId: targetDeal.id,
    stakeholderId: targetStakeholder?.id,
    timestamp: new Date(),
    source: template.sources[Math.floor(Math.random() * template.sources.length)],
    sentiment: template.sentiments[templateIdx],
    metadata: {
      dealCompany: getCompanyById(targetDeal.companyId)?.name || targetDeal.name,
      stakeholderName: targetStakeholder?.name,
      stakeholderRole: targetStakeholder?.role
    }
  };
}

// Weight activity types based on deal stage
function getWeightedActivityTypes(deal: Deal): ActivityType[] {
  const baseTypes: ActivityType[] = ['email_received', 'email_sent', 'document_viewed'];
  
  // 5% chance of critical event
  if (Math.random() < 0.05) {
    const criticalTypes: ActivityType[] = [
      'stakeholder_departed',
      'stakeholder_hired',
      'budget_signed',
      'budget_frozen',
      'contract_executed',
      'deal_blocked'
    ];
    return [criticalTypes[Math.floor(Math.random() * criticalTypes.length)]];
  }
  
  if (deal.stage === 'diagnose') {
    return [...baseTypes, 'meeting_scheduled', 'stakeholder_added', 'email_received'];
  } else if (deal.stage === 'validate') {
    return [...baseTypes, 'document_shared', 'meeting_completed', 'timeline_discussed'];
  } else if (deal.stage === 'align') {
    return [...baseTypes, 'budget_mentioned', 'champion_activity', 'executive_engagement', 'competitor_mentioned'];
  } else {
    return [...baseTypes, 'executive_engagement', 'budget_mentioned', 'meeting_completed'];
  }
}

// Generate batch of historical activities for a deal
export function generateHistoricalActivities(deal: Deal, count: number = 20): SimulatedActivity[] {
  const activities: SimulatedActivity[] = [];
  const dealStakeholders = stakeholders.filter(s => s.dealId === deal.id);
  const startDate = new Date(deal.dealStartDate);
  const now = new Date();
  const dayRange = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * dayRange);
    const stakeholder = dealStakeholders.length > 0 
      ? dealStakeholders[Math.floor(Math.random() * dealStakeholders.length)]
      : undefined;
    
    const activity = generateActivity(deal, stakeholder);
    activity.timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    activities.push(activity);
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Simulation controller class
export class SimulationController {
  private intervalId: number | null = null;
  private onActivityGenerated: ((activity: SimulatedActivity) => void) | null = null;
  private intervalMs: number = 30000; // Default 30 seconds

  start(onActivity: (activity: SimulatedActivity) => void, intervalMs: number = 30000) {
    this.onActivityGenerated = onActivity;
    this.intervalMs = intervalMs;
    
    // Generate initial activity
    this.tick();
    
    // Start interval
    this.intervalId = window.setInterval(() => this.tick(), this.intervalMs);
  }

  private tick() {
    if (this.onActivityGenerated) {
      const activity = generateActivity();
      this.onActivityGenerated(activity);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setInterval(ms: number) {
    this.intervalMs = ms;
    if (this.intervalId && this.onActivityGenerated) {
      this.stop();
      this.start(this.onActivityGenerated, ms);
    }
  }

  // Trigger a specific type of activity for a deal
  triggerActivity(dealId: number, type?: ActivityType): SimulatedActivity | null {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return null;
    
    const activity = generateActivity(deal);
    if (type) activity.type = type;
    
    if (this.onActivityGenerated) {
      this.onActivityGenerated(activity);
    }
    
    return activity;
  }
}

export const simulationController = new SimulationController();
