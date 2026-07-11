// Persistent Signals and Risks Data
// Initial seed data for realistic demo experience

import { DetectedSignal } from "@/stores/signalsStore";
import { stakeholders, deals, getCompanyById } from "./dealData";

// Helper to get stakeholder info for signals
const getStakeholderForSignal = (stakeholderId: number) => {
  const s = stakeholders.find(st => st.id === stakeholderId);
  if (!s) return undefined;
  return {
    id: s.id,
    name: s.name,
    role: s.role,
    avatar: s.avatar,
  };
};

const getDealName = (dealId: number) => {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return "Unknown Deal";
  return deal.name; // Return deal name, not company name
};

// Generate date in the past
const daysAgo = (days: number, hours = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  return d;
};

// Seed signals and risks data
export const seedSignals: Omit<DetectedSignal, 'id'>[] = [
  // Active Risks
  {
    type: "risk",
    name: "Engagement Drop",
    trigger: "CTO showing signs of disengagement, 40% drop in communication frequency",
    evidence: "Email response time increased from 2 to 8 hours, meeting attendance dropped by 62%",
    dealId: 1,
    dealName: getDealName(1),
    stakeholder: getStakeholderForSignal(1),
    priority: "high",
    sentiment: "negative",
    confidence: 85,
    suggestedAction: "Schedule executive alignment call with Champion",
    channel: "email",
    detectedAt: daysAgo(0, 1),
    isUrgent: true,
    status: "pending",
  },
  {
    type: "risk",
    name: "Budget Concern",
    trigger: "CFO mentioned competitor pricing in internal email - possible budget pressure",
    evidence: "Email thread forwarded from Michael Chen discussing alternative vendor pricing with procurement team",
    dealId: 1,
    dealName: getDealName(1),
    stakeholder: getStakeholderForSignal(1),
    priority: "high",
    sentiment: "negative",
    confidence: 87,
    suggestedAction: "Prepare competitive analysis and value differentiation document for CFO meeting",
    channel: "email",
    detectedAt: daysAgo(0, 3),
    isUrgent: true,
    status: "pending",
  },
  {
    type: "risk",
    name: "Timeline Delay",
    trigger: "VP Engineering requested to push technical review by 2 weeks due to internal project conflicts",
    evidence: "Calendar invite declined with note: 'Team bandwidth constrained until Feb 5'",
    dealId: 2,
    dealName: getDealName(2),
    stakeholder: getStakeholderForSignal(6),
    priority: "high",
    sentiment: "negative",
    confidence: 92,
    suggestedAction: "Propose async technical review options or offer to work with secondary technical contacts",
    channel: "calendar",
    detectedAt: daysAgo(0, 8),
    isUrgent: true,
    status: "pending",
  },
  {
    type: "risk",
    name: "Stakeholder Disengagement",
    trigger: "CMO has not responded to last 3 emails - potential loss of executive sponsorship",
    evidence: "No email opens tracked, no calendar availability for proposed meetings",
    dealId: 4,
    dealName: getDealName(4),
    stakeholder: getStakeholderForSignal(16),
    priority: "high",
    sentiment: "negative",
    confidence: 78,
    suggestedAction: "Reach out through Marketing Director as intermediary to re-engage CMO",
    channel: "email",
    detectedAt: daysAgo(1, 2),
    isUrgent: false,
    status: "pending",
  },
  {
    type: "risk",
    name: "Compliance Blocker",
    trigger: "DPO flagged additional GDPR requirements not covered in current proposal",
    evidence: "Meeting notes from compliance review session flagging data residency concerns",
    dealId: 2,
    dealName: getDealName(2),
    stakeholder: getStakeholderForSignal(7),
    priority: "high",
    sentiment: "negative",
    confidence: 95,
    suggestedAction: "Schedule urgent call with DPO to address data residency and prepare EU hosting options",
    channel: "meeting",
    detectedAt: daysAgo(0, 12),
    isUrgent: true,
    status: "pending",
  },

  // Active Signals (Positive)
  {
    type: "signal",
    name: "Champion Engagement",
    trigger: "VP Operations shared our proposal deck with 3 additional executives internally",
    evidence: "Email tracking shows proposal forwarded to CIO, COO, and CFO with positive commentary",
    dealId: 1,
    dealName: getDealName(1),
    stakeholder: getStakeholderForSignal(2),
    priority: "high",
    sentiment: "positive",
    confidence: 94,
    suggestedAction: "Prepare executive-specific talking points for each new stakeholder",
    channel: "email",
    detectedAt: daysAgo(0, 5),
    isUrgent: false,
    status: "pending",
  },
  {
    type: "signal",
    name: "Budget Approval",
    trigger: "Head of E-commerce confirmed Q2 budget has been formally allocated for this initiative",
    evidence: "Call recording transcript confirms budget approval from finance committee",
    dealId: 3,
    dealName: getDealName(3),
    stakeholder: getStakeholderForSignal(10),
    priority: "high",
    sentiment: "positive",
    confidence: 96,
    suggestedAction: "Send formal proposal with implementation timeline options for Q2 start",
    channel: "call",
    detectedAt: daysAgo(1, 0),
    isUrgent: false,
    status: "pending",
  },
  {
    type: "signal",
    name: "Technical Validation",
    trigger: "CTO approved technical architecture after security review passed all requirements",
    evidence: "Security assessment report marked as 'Approved' with CTO signature",
    dealId: 2,
    dealName: getDealName(2),
    stakeholder: getStakeholderForSignal(4),
    priority: "medium",
    sentiment: "positive",
    confidence: 98,
    suggestedAction: "Schedule implementation planning session with technical team",
    channel: "document",
    detectedAt: daysAgo(0, 16),
    isUrgent: false,
    status: "pending",
  },
  {
    type: "signal",
    name: "Competitor Weakness",
    trigger: "Procurement mentioned competitor's recent security incident in industry news",
    evidence: "Email from Lisa Chen referencing news article about competitor data breach",
    dealId: 5,
    dealName: getDealName(5),
    stakeholder: getStakeholderForSignal(18),
    priority: "medium",
    sentiment: "positive",
    confidence: 72,
    suggestedAction: "Prepare security comparison highlighting our track record and certifications",
    channel: "email",
    detectedAt: daysAgo(2, 4),
    isUrgent: false,
    status: "pending",
  },
  {
    type: "signal",
    name: "Executive Interest",
    trigger: "Design Director requested demo for CEO and full leadership team",
    evidence: "Calendar invite created for 'Leadership Demo Session' with 6 executives",
    dealId: 7,
    dealName: getDealName(7),
    stakeholder: getStakeholderForSignal(23),
    priority: "high",
    sentiment: "positive",
    confidence: 88,
    suggestedAction: "Prepare executive-level presentation focusing on strategic business impact",
    channel: "calendar",
    detectedAt: daysAgo(0, 20),
    isUrgent: false,
    status: "pending",
  },
  // Critical Events - Game Changers
  {
    type: "risk",
    severity: "critical",
    eventCategory: "stakeholder_departure",
    name: "Champion Left Company",
    trigger: "Michael Chen (VP Operations) has left TechFlow Solutions - LinkedIn profile shows 'Open to Work'",
    evidence: "LinkedIn profile updated 2 days ago. No company email activity in 5 days. Company directory listing removed.",
    dealId: 1,
    dealName: getDealName(1),
    stakeholder: getStakeholderForSignal(2),
    priority: "high",
    sentiment: "negative",
    confidence: 95,
    suggestedAction: "Identify new champion immediately. Request introduction to Michael's replacement. Assess impact on deal timeline.",
    channel: "LinkedIn + Email",
    detectedAt: daysAgo(0, 2),
    isUrgent: true,
    status: "pending",
  },
  {
    type: "signal",
    severity: "critical",
    eventCategory: "budget_approved",
    name: "Budget Formally Signed",
    trigger: "CFO David Kim signed off on Q2 budget allocation for our initiative - $450K approved",
    evidence: "Email confirmation from finance team with attached approval document. Budget code assigned.",
    dealId: 3,
    dealName: getDealName(3),
    stakeholder: getStakeholderForSignal(12),
    priority: "high",
    sentiment: "positive",
    confidence: 98,
    suggestedAction: "Send implementation timeline proposal within 24 hours. Schedule kickoff planning call.",
    channel: "Email + Finance System",
    detectedAt: daysAgo(0, 6),
    isUrgent: false,
    status: "pending",
  },
  {
    type: "risk",
    severity: "critical",
    eventCategory: "deal_blocked",
    name: "Deal Put On Hold",
    trigger: "Board has paused all new technology initiatives until Q3 - reported by VP of Strategy",
    evidence: "Company-wide memo shared internally. All vendor evaluations suspended per CFO directive.",
    dealId: 5,
    dealName: getDealName(5),
    stakeholder: getStakeholderForSignal(17),
    priority: "high",
    sentiment: "negative",
    confidence: 92,
    suggestedAction: "Maintain relationship with champion. Propose low-touch pilot or POC to stay engaged.",
    channel: "Email + CRM Notes",
    detectedAt: daysAgo(0, 10),
    isUrgent: true,
    status: "pending",
  },
  {
    type: "signal",
    severity: "critical",
    eventCategory: "stakeholder_arrival",
    name: "New CTO Appointed",
    trigger: "Jennifer Walsh appointed as new CTO at RetailMax Corp - strong digital transformation advocate",
    evidence: "LinkedIn announcement. Previous role: VP Engineering at customer company. Known advocate for our type of solution.",
    dealId: 4,
    dealName: getDealName(4),
    stakeholder: getStakeholderForSignal(15),
    priority: "high",
    sentiment: "positive",
    confidence: 90,
    suggestedAction: "Research Jennifer's background. Request introduction through mutual connections. Prepare tailored executive briefing.",
    channel: "LinkedIn + News",
    detectedAt: daysAgo(0, 14),
    isUrgent: false,
    status: "pending",
  },
];

// Processed/Ignored signals for history
export const historicalSignals: Omit<DetectedSignal, 'id'>[] = [
  {
    type: "signal",
    name: "Contract Review Started",
    trigger: "Legal counsel began reviewing contract terms - moving toward final stages",
    evidence: "Email confirmation from legal team acknowledging receipt of contract draft",
    dealId: 3,
    dealName: getDealName(3),
    stakeholder: getStakeholderForSignal(11),
    priority: "medium",
    sentiment: "positive",
    confidence: 85,
    suggestedAction: "Prepare redline response document for anticipated legal questions",
    channel: "email",
    detectedAt: daysAgo(5, 0),
    isUrgent: false,
    status: "processed",
    processedAt: daysAgo(4, 12),
    actionsGenerated: [101, 102],
  },
  {
    type: "risk",
    name: "Decision Delay",
    trigger: "COO mentioned board meeting postponement affecting timeline",
    evidence: "Call notes indicating decision pushed to next board cycle",
    dealId: 3,
    dealName: getDealName(3),
    stakeholder: getStakeholderForSignal(12),
    priority: "medium",
    sentiment: "negative",
    confidence: 80,
    suggestedAction: "Identify interim decision maker or alternative approval path",
    channel: "call",
    detectedAt: daysAgo(7, 0),
    isUrgent: false,
    status: "processed",
    processedAt: daysAgo(6, 8),
    actionsGenerated: [103],
  },
  {
    type: "signal",
    name: "Reference Request",
    trigger: "IT Director requested customer references in similar industry",
    evidence: "Email requesting 2-3 case studies from technology sector",
    dealId: 5,
    dealName: getDealName(5),
    stakeholder: getStakeholderForSignal(17),
    priority: "low",
    sentiment: "positive",
    confidence: 90,
    suggestedAction: "Send curated reference package with relevant case studies",
    channel: "email",
    detectedAt: daysAgo(10, 0),
    isUrgent: false,
    status: "ignored",
    processedAt: daysAgo(9, 6),
  },
  {
    type: "risk",
    name: "Budget Freeze Rumor",
    trigger: "Finance mentioned potential Q1 budget freeze in casual conversation",
    evidence: "Meeting sidebar comment about company-wide cost review",
    dealId: 6,
    dealName: getDealName(6),
    stakeholder: getStakeholderForSignal(22),
    priority: "low",
    sentiment: "negative",
    confidence: 55,
    suggestedAction: "Verify budget status with procurement contact",
    channel: "meeting",
    detectedAt: daysAgo(14, 0),
    isUrgent: false,
    status: "ignored",
    processedAt: daysAgo(13, 4),
  },
];

// Function to initialize signals store with seed data
export const initializeSignals = (): DetectedSignal[] => {
  const allSignals = [...seedSignals, ...historicalSignals];
  return allSignals.map((signal, index) => ({
    ...signal,
    id: `seed_${Date.now()}_${index}`,
    detectedAt: signal.detectedAt,
    processedAt: signal.processedAt,
  }));
};

// Action templates generated from signals
export interface GeneratedAction {
  id: number;
  title: string;
  stakeholderIds: number[];
  artifact: string;
  basedOn: string;
  priority: "high" | "medium" | "low";
  type: "email" | "meeting";
  deadline: string;
  dealId: number;
  signalId?: string;
}

// Generate actions based on a signal/risk
export const generateActionsFromSignal = (signal: DetectedSignal): GeneratedAction[] => {
  const actions: GeneratedAction[] = [];
  const baseId = Date.now();
  
  const deal = deals.find(d => {
    const company = getCompanyById(d.companyId);
    return company?.name === signal.dealName;
  });
  
  if (!deal) return [];
  
  // High priority signals get 2 actions, others get 1
  if (signal.priority === "high") {
    // Primary action
    actions.push({
      id: baseId,
      title: signal.suggestedAction || `Follow up on: ${signal.name}`,
      stakeholderIds: signal.stakeholder ? [signal.stakeholder.id] : [],
      artifact: signal.type === "risk" ? "Risk Mitigation Plan" : "Follow-up Document",
      basedOn: signal.trigger.slice(0, 60) + "...",
      priority: signal.priority,
      type: signal.channel === "meeting" || signal.channel === "call" ? "meeting" : "email",
      deadline: signal.isUrgent ? "Today" : "Tomorrow",
      dealId: deal.id,
      signalId: signal.id,
    });
    
    // Secondary action for stakeholder engagement
    const relatedStakeholders = stakeholders.filter(s => s.dealId === deal.id && s.id !== signal.stakeholder?.id);
    if (relatedStakeholders.length > 0) {
      actions.push({
        id: baseId + 1,
        title: `Update ${relatedStakeholders[0].name} on ${signal.name.toLowerCase()} developments`,
        stakeholderIds: [relatedStakeholders[0].id],
        artifact: "Status Update",
        basedOn: `Related to ${signal.name}`,
        priority: "medium",
        type: "email",
        deadline: "This week",
        dealId: deal.id,
        signalId: signal.id,
      });
    }
  } else {
    actions.push({
      id: baseId,
      title: signal.suggestedAction || `Address: ${signal.name}`,
      stakeholderIds: signal.stakeholder ? [signal.stakeholder.id] : [],
      artifact: "Follow-up Document",
      basedOn: signal.trigger.slice(0, 60) + "...",
      priority: signal.priority,
      type: "email",
      deadline: "This week",
      dealId: deal.id,
      signalId: signal.id,
    });
  }
  
  return actions;
};

// Calculate score impact from processing a signal
export const calculateScoreImpact = (signal: DetectedSignal): { winProbability: number; alignment: number } => {
  // Critical events have much higher impact
  if (signal.severity === 'critical') {
    const criticalBase = signal.priority === 'high' ? 12 : 8;
    if (signal.type === 'risk') {
      // Critical risks: addressing them recovers some ground
      return {
        winProbability: criticalBase - 2, // Slightly less than the damage prevented
        alignment: Math.round(criticalBase * 0.5),
      };
    } else {
      // Critical positive events: major boost
      return {
        winProbability: criticalBase + 3,
        alignment: criticalBase,
      };
    }
  }
  
  // Normal events
  const baseImpact = signal.priority === "high" ? 3 : signal.priority === "medium" ? 2 : 1;
  
  if (signal.type === "risk") {
    // Risks being addressed improve scores slightly
    return {
      winProbability: baseImpact,
      alignment: Math.round(baseImpact * 0.5),
    };
  } else {
    // Positive signals improve scores more
    return {
      winProbability: baseImpact + 1,
      alignment: baseImpact,
    };
  }
};

// Critical event category labels
export const CRITICAL_EVENT_LABELS: Record<string, string> = {
  stakeholder_departure: 'Stakeholder Departure',
  stakeholder_arrival: 'Stakeholder Arrival',
  budget_approved: 'Budget Approved',
  budget_frozen: 'Budget Frozen',
  contract_signed: 'Contract Signed',
  org_change: 'Org Change',
  deal_blocked: 'Deal Blocked',
};
