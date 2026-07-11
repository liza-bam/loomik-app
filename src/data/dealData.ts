// Centralized Deal Data - Single Source of Truth
// All components should import from this file for consistency

import sh1 from "@/assets/stakeholders/sh1.jpg";
import sh2 from "@/assets/stakeholders/sh2.jpg";
import sh3 from "@/assets/stakeholders/sh3.jpg";
import sh4 from "@/assets/stakeholders/sh4.jpg";
import sh5 from "@/assets/stakeholders/sh5.jpg";
import sh6 from "@/assets/stakeholders/sh6.jpg";
import sh7 from "@/assets/stakeholders/sh7.jpg";
import sh8 from "@/assets/stakeholders/sh8.jpg";
import sh9 from "@/assets/stakeholders/sh9.jpg";
import hubspotLogo from "@/assets/logos/hubspot-sprocket.svg";

// ==================== TYPES ====================

export type DealStage = "diagnose" | "validate" | "align" | "commit";

export type StakeholderStatus = "positive" | "neutral" | "negative";

export type ActionPriority = "high" | "medium" | "low";

export type ActionType = "email" | "meeting";

export type EngagementCategory = "engaged" | "silent" | "hidden";

// NEW: Company interface - separate from Deal
export interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
}

export interface StakeholderTrend {
  date: string;
  alignment: number;
  priority: number;
  sentiment: number;
}

export interface LastInteraction {
  date: string;
  summary: string;
}

export interface BuyerValueMap {
  costReduction: number;
  threatMitigation: number;
  speedToValue: number;
}

export interface Stakeholder {
  id: number;
  dealId: number;
  companyId: number; // NEW: Reference to company
  name: string;
  role: string;
  avatar?: string;
  status: StakeholderStatus;
  alignment: number;
  priority: number;
  sentiment: number;
  engagement: number;
  costInterest: boolean;
  threatInterest: boolean;
  speedInterest: boolean;
  buyerValueMap: BuyerValueMap;
  summary: string;
  lastInteraction: LastInteraction;
  trends: StakeholderTrend[];
  engagementCategory: EngagementCategory;
  relatedActionIds: number[];
}

export interface Action {
  id: number;
  dealId: number;
  title: string;
  stakeholderIds: number[];
  artifact: string;
  basedOn: string;
  priority: ActionPriority;
  type: ActionType;
  deadline: string;
  status: "pending" | "done" | "archived";
}

export interface DealSummary {
  text: string;
  headline: string;
  context: string;
  action: string;
}

// UPDATED: Deal now references a Company
export interface Deal {
  id: number;
  companyId: number; // NEW: Reference to company
  name: string; // NEW: Deal name (e.g., "HR IT Redesign")
  value: string;
  valueNumeric: number;
  closeDate: string;
  dealStartDate: string;
  stage: DealStage;
  winProbability: number;
  alignment: number;
  consensus: number;
  sentiment: number;
  hasRisk: boolean;
  summary: DealSummary;
}

// ==================== STAGE CONFIGURATION ====================

export const stageConfig: Record<DealStage, {
  label: string;
  tooltip: string;
  colorClass: string;
  dotColor: string;
}> = {
  diagnose: {
    label: "Diagnose",
    tooltip: "Discovering buyer needs, pain points, and decision criteria",
    colorClass: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500"
  },
  validate: {
    label: "Validate",
    tooltip: "Confirming fit between solution capabilities and buyer requirements",
    colorClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dotColor: "bg-yellow-500"
  },
  align: {
    label: "Align",
    tooltip: "Building consensus across stakeholders and aligning on value",
    colorClass: "bg-orange-100 text-orange-700 border-orange-200",
    dotColor: "bg-orange-500"
  },
  commit: {
    label: "Commit",
    tooltip: "Finalizing terms, addressing objections, and closing the deal",
    colorClass: "bg-green-100 text-green-700 border-green-200",
    dotColor: "bg-green-500"
  }
};

// ==================== BUYER VALUE CONFIGURATION ====================

export const buyerValueConfig = {
  costReduction: {
    icon: "DollarSign",
    label: "Cost Reduction",
    tooltip: "Focus on ROI, savings, and cost optimization. Higher % = stronger interest"
  },
  threatMitigation: {
    icon: "Shield",
    label: "Threat Mitigation",
    tooltip: "Risk avoidance, security, and compliance concerns. Higher % = stronger interest"
  },
  speedToValue: {
    icon: "Zap",
    label: "Speed to Value",
    tooltip: "Time to implementation and ROI realization. Higher % = stronger interest"
  }
};

// ==================== AVATAR COLORS ====================

export const avatarColors = [
  "bg-slate-200 text-slate-600",
  "bg-zinc-200 text-zinc-600",
  "bg-stone-200 text-stone-600",
  "bg-blue-100 text-blue-600",
  "bg-violet-100 text-violet-600",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-600",
  "bg-purple-100 text-purple-600",
];

export const getAvatarColor = (id: number): string => 
  avatarColors[id % avatarColors.length];

// ==================== COMPANIES DATA ====================

export const companies: Company[] = [
  {
    id: 1,
    name: "Salesforce",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png",
    industry: "Enterprise Software"
  },
  {
    id: 2,
    name: "Stripe",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1280px-Stripe_Logo%2C_revised_2016.svg.png",
    industry: "Financial Technology"
  },
  {
    id: 3,
    name: "Shopify",
    logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
    industry: "E-commerce"
  },
  {
    id: 4,
    name: "HubSpot",
    logo: hubspotLogo,
    industry: "Marketing Software"
  },
  {
    id: 5,
    name: "Slack",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1024px-Slack_icon_2019.svg.png",
    industry: "Collaboration"
  },
  {
    id: 6,
    name: "Notion",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1024px-Notion-logo.svg.png",
    industry: "Productivity"
  },
  {
    id: 7,
    name: "Figma",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/1024px-Figma-logo.svg.png",
    industry: "Design Tools"
  }
];

// ==================== DEALS DATA ====================

export const deals: Deal[] = [
  {
    id: 1,
    companyId: 1, // Salesforce
    name: "Enterprise Platform Expansion",
    value: "$2,400,000",
    valueNumeric: 2400000,
    closeDate: "Mar 15, 2025",
    dealStartDate: "2024-12-01",
    stage: "align",
    winProbability: 76, // Capped below 100
    alignment: 83,
    consensus: 71,
    sentiment: 77,
    hasRisk: true,
    summary: {
      text: "Enterprise platform expansion nearing final negotiations. Key decision makers aligned on value prop. CFO requires additional ROI justification.",
      headline: "CFO requested ROI breakdown; decision timeline moved up 3 weeks",
      context: "VP Operations confirmed Q2 budget. Competitor mentioned in procurement email. This is our #1 deal by value.",
      action: "Send ROI Calculator to Michael Chen (CFO) addressing cost justification concerns raised in his last email."
    }
  },
  {
    id: 2,
    companyId: 2, // Stripe
    name: "Payment Infrastructure Upgrade",
    value: "$1,800,000",
    valueNumeric: 1800000,
    closeDate: "Feb 28, 2025",
    dealStartDate: "2024-10-15",
    stage: "validate",
    winProbability: 72,
    alignment: 68,
    consensus: 65,
    sentiment: 70,
    hasRisk: true,
    summary: {
      text: "Security-focused infrastructure deal with strong technical alignment. Multiple stakeholders engaged. Compliance review in progress.",
      headline: "Security review passed; procurement timeline accelerated",
      context: "CTO championing internally. DPO has outstanding compliance questions. Infrastructure team highly engaged.",
      action: "Schedule compliance deep-dive with Patricia Wong (DPO) to address remaining GDPR concerns."
    }
  },
  {
    id: 3,
    companyId: 3, // Shopify
    name: "E-commerce Integration Suite",
    value: "$950,000",
    valueNumeric: 950000,
    closeDate: "Apr 10, 2025",
    dealStartDate: "2024-11-20",
    stage: "validate",
    winProbability: 65,
    alignment: 72,
    consensus: 68,
    sentiment: 65,
    hasRisk: false,
    summary: {
      text: "E-commerce integration platform deal progressing well. Legal review ongoing. Strong alignment with business objectives.",
      headline: "Head of E-commerce confirmed budget allocation for Q2",
      context: "Legal counsel reviewing contract terms. COO supportive but wants faster implementation timeline.",
      action: "Prepare implementation timeline options for John Miller (COO) showing accelerated deployment path."
    }
  },
  {
    id: 4,
    companyId: 4, // HubSpot
    name: "Marketing Automation Expansion",
    value: "$1,200,000",
    valueNumeric: 1200000,
    closeDate: "Mar 22, 2025",
    dealStartDate: "2024-11-01",
    stage: "diagnose",
    winProbability: 58,
    alignment: 45,
    consensus: 42,
    sentiment: 55,
    hasRisk: true,
    summary: {
      text: "Marketing automation expansion showing mixed signals. CMO engaged but CFO has budget concerns. Needs stronger business case.",
      headline: "Marketing Director pushing for quick decision; CFO requesting more data",
      context: "CMO sees strategic value but finance team skeptical. Competitor offering lower price point.",
      action: "Build comprehensive business case with Jennifer Adams (Marketing Director) to address CFO's concerns."
    }
  },
  {
    id: 5,
    companyId: 5, // Slack
    name: "Enterprise Collaboration Platform",
    value: "$750,000",
    valueNumeric: 750000,
    closeDate: "May 5, 2025",
    dealStartDate: "2025-01-05",
    stage: "diagnose",
    winProbability: 52,
    alignment: 61,
    consensus: 55,
    sentiment: 58,
    hasRisk: false,
    summary: {
      text: "Collaboration platform deal in early discovery. IT Director engaged but procurement process unclear. Good technical fit.",
      headline: "IT Director confirmed pain points align with our solution",
      context: "Procurement Lead gathering requirements. VP Infrastructure evaluating alternatives.",
      action: "Schedule discovery call with Lisa Chen (Procurement Lead) to understand buying process."
    }
  },
  {
    id: 6,
    companyId: 6, // Notion
    name: "Productivity Suite Rollout",
    value: "$580,000",
    valueNumeric: 580000,
    closeDate: "Apr 18, 2025",
    dealStartDate: "2024-12-10",
    stage: "diagnose",
    winProbability: 45,
    alignment: 38,
    consensus: 35,
    sentiment: 42,
    hasRisk: true,
    summary: {
      text: "Productivity platform deal facing headwinds. CEO skeptical of timing. Product team interested but lacks budget authority.",
      headline: "VP Product interested but CEO questioning strategic timing",
      context: "Product Manager championing internally. CEO focused on other priorities. Budget cycle mismatch.",
      action: "Develop executive summary for Steve Jobs Jr (CEO) showing strategic alignment with company goals."
    }
  },
  {
    id: 7,
    companyId: 7, // Figma
    name: "Design Tools Enterprise License",
    value: "$320,000",
    valueNumeric: 320000,
    closeDate: "Jun 1, 2025",
    dealStartDate: "2025-01-10",
    stage: "diagnose",
    winProbability: 35,
    alignment: 42,
    consensus: 38,
    sentiment: 45,
    hasRisk: false,
    summary: {
      text: "Design tools deal in early stages. Design Director engaged. Finance team not yet involved. Long sales cycle expected.",
      headline: "Design Director excited about capabilities; early stage exploration",
      context: "Procurement Manager gathering initial requirements. Finance Director not yet engaged.",
      action: "Prepare capability demo for Kevin Brown (Design Director) focusing on team collaboration features."
    }
  }
];

// ==================== STAKEHOLDERS DATA ====================

export const stakeholders: Stakeholder[] = [
  // Salesforce (Deal ID: 1, Company ID: 1)
  {
    id: 1,
    dealId: 1,
    companyId: 1,
    name: "Michael Chen",
    role: "CFO",
    avatar: sh2, // Male photo for male name
    status: "neutral",
    alignment: 52,
    priority: 48,
    sentiment: 55,
    engagement: 45,
    costInterest: true,
    threatInterest: false,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 85,
      threatMitigation: 35,
      speedToValue: 65
    },
    summary: "Key financial decision maker at Salesforce. Focused on demonstrating clear ROI. Has expressed budget concerns that need addressing before final approval.",
    lastInteraction: {
      date: "3 days ago",
      summary: "Requested ROI breakdown and cost justification via email"
    },
    trends: [
      { date: "2024-10-01", alignment: 32, priority: 65, sentiment: 42 },
      { date: "2024-10-20", alignment: 38, priority: 58, sentiment: 55 },
      { date: "2024-11-08", alignment: 42, priority: 72, sentiment: 48 },
      { date: "2024-11-25", alignment: 35, priority: 68, sentiment: 62 },
      { date: "2024-12-12", alignment: 48, priority: 78, sentiment: 52 },
      { date: "2025-01-02", alignment: 45, priority: 82, sentiment: 58 },
      { date: "2025-01-15", alignment: 52, priority: 75, sentiment: 55 }
    ],
    engagementCategory: "silent",
    relatedActionIds: [1, 13]
  },
  {
    id: 2,
    dealId: 1,
    companyId: 1,
    name: "Sarah Williams",
    role: "VP Operations",
    avatar: sh1, // Female photo for female name
    status: "positive",
    alignment: 89, // Capped below 100
    priority: 86,
    sentiment: 88,
    engagement: 91,
    costInterest: false,
    threatInterest: true,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 45,
      threatMitigation: 78,
      speedToValue: 89
    },
    summary: "Strong internal champion. Confirmed Q2 budget availability. Pushing for faster implementation timeline.",
    lastInteraction: {
      date: "1 day ago",
      summary: "Confirmed budget and requested implementation timeline"
    },
    trends: [
      { date: "2024-10-01", alignment: 68, priority: 55, sentiment: 62 },
      { date: "2024-10-20", alignment: 75, priority: 62, sentiment: 78 },
      { date: "2024-11-08", alignment: 82, priority: 58, sentiment: 72 },
      { date: "2024-11-25", alignment: 78, priority: 72, sentiment: 85 },
      { date: "2024-12-12", alignment: 86, priority: 78, sentiment: 80 },
      { date: "2025-01-02", alignment: 84, priority: 82, sentiment: 86 },
      { date: "2025-01-15", alignment: 89, priority: 84, sentiment: 88 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [2]
  },
  {
    id: 3,
    dealId: 1,
    companyId: 1,
    name: "Tom Richards",
    role: "CIO",
    avatar: sh3, // Male photo for male name
    status: "positive",
    alignment: 86, // Capped below 100
    priority: 81,
    sentiment: 84,
    engagement: 83,
    costInterest: false,
    threatInterest: true,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 55,
      threatMitigation: 86,
      speedToValue: 42
    },
    summary: "Technology decision maker. Aligned on technical capabilities. Supportive of the initiative.",
    lastInteraction: {
      date: "5 days ago",
      summary: "Technical review meeting - approved architecture"
    },
    trends: [
      { date: "2024-10-01", alignment: 72, priority: 58, sentiment: 65 },
      { date: "2024-10-20", alignment: 78, priority: 65, sentiment: 72 },
      { date: "2024-11-08", alignment: 75, priority: 72, sentiment: 68 },
      { date: "2024-11-25", alignment: 82, priority: 68, sentiment: 78 },
      { date: "2024-12-12", alignment: 80, priority: 75, sentiment: 82 },
      { date: "2025-01-02", alignment: 84, priority: 72, sentiment: 78 },
      { date: "2025-01-15", alignment: 86, priority: 78, sentiment: 84 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [16]
  },
  // Stripe (Deal ID: 2)
  {
    id: 4,
    dealId: 2,
    companyId: 2,
    name: "James Kumar",
    role: "CTO",
    avatar: sh4, // Male photo for male name
    status: "positive",
    alignment: 85,
    priority: 80,
    sentiment: 88,
    engagement: 88,
    costInterest: false,
    threatInterest: true,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 35,
      threatMitigation: 90,
      speedToValue: 85
    },
    summary: "Technical champion at Stripe. Driving the initiative internally. Strong advocate for our solution.",
    lastInteraction: {
      date: "2 days ago",
      summary: "Shared internal approval timeline and next steps"
    },
    trends: [
      { date: "2024-09-15", alignment: 62, priority: 75, sentiment: 58 },
      { date: "2024-10-05", alignment: 72, priority: 82, sentiment: 65 },
      { date: "2024-10-25", alignment: 68, priority: 78, sentiment: 72 },
      { date: "2024-11-15", alignment: 78, priority: 85, sentiment: 68 },
      { date: "2024-12-05", alignment: 75, priority: 88, sentiment: 78 },
      { date: "2024-12-25", alignment: 82, priority: 85, sentiment: 82 },
      { date: "2025-01-15", alignment: 85, priority: 80, sentiment: 88 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [3, 4]
  },
  {
    id: 5,
    dealId: 2,
    companyId: 2,
    name: "Emily Zhang",
    role: "Security Lead",
    avatar: sh5, // Female photo for female name
    status: "neutral",
    alignment: 65,
    priority: 62,
    sentiment: 68,
    engagement: 78,
    costInterest: false,
    threatInterest: true,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 25,
      threatMitigation: 91,
      speedToValue: 30
    },
    summary: "Security gatekeeper. Thorough in compliance reviews. Needs detailed security documentation.",
    lastInteraction: {
      date: "4 days ago",
      summary: "Requested additional security compliance documentation"
    },
    trends: [
      { date: "2024-09-15", alignment: 42, priority: 83, sentiment: 38 },
      { date: "2024-10-05", alignment: 48, priority: 87, sentiment: 45 },
      { date: "2024-10-25", alignment: 52, priority: 85, sentiment: 52 },
      { date: "2024-11-15", alignment: 48, priority: 89, sentiment: 48 },
      { date: "2024-12-05", alignment: 58, priority: 86, sentiment: 55 },
      { date: "2024-12-25", alignment: 55, priority: 84, sentiment: 58 },
      { date: "2025-01-15", alignment: 65, priority: 82, sentiment: 68 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [5]
  },
  {
    id: 6,
    dealId: 2,
    companyId: 2,
    name: "Mark Stevens",
    role: "Engineering VP",
    avatar: sh6, // Male photo for male name
    status: "positive",
    alignment: 78,
    priority: 75,
    sentiment: 80,
    engagement: 82,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 40,
      threatMitigation: 65,
      speedToValue: 86
    },
    summary: "Engineering leader. Focused on integration speed and developer experience.",
    lastInteraction: {
      date: "1 week ago",
      summary: "Discussed API integration requirements"
    },
    trends: [
      { date: "2024-09-15", alignment: 58, priority: 62, sentiment: 52 },
      { date: "2024-10-05", alignment: 65, priority: 72, sentiment: 60 },
      { date: "2024-10-25", alignment: 62, priority: 78, sentiment: 68 },
      { date: "2024-11-15", alignment: 72, priority: 75, sentiment: 62 },
      { date: "2024-12-05", alignment: 68, priority: 82, sentiment: 75 },
      { date: "2024-12-25", alignment: 75, priority: 78, sentiment: 72 },
      { date: "2025-01-15", alignment: 78, priority: 82, sentiment: 80 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [6]
  },
  {
    id: 7,
    dealId: 2,
    companyId: 2,
    name: "Patricia Wong",
    role: "DPO",
    avatar: sh7, // Female photo for female name
    status: "negative",
    alignment: 42,
    priority: 38,
    sentiment: 45,
    engagement: 52,
    costInterest: false,
    threatInterest: true,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 20,
      threatMitigation: 94,
      speedToValue: 15
    },
    summary: "Data Protection Officer. Has outstanding GDPR compliance concerns that need addressing.",
    lastInteraction: {
      date: "6 days ago",
      summary: "Raised concerns about data processing agreement terms"
    },
    trends: [
      { date: "2024-09-15", alignment: 58, priority: 86, sentiment: 55 },
      { date: "2024-10-05", alignment: 52, priority: 88, sentiment: 48 },
      { date: "2024-10-25", alignment: 48, priority: 89, sentiment: 52 },
      { date: "2024-11-15", alignment: 55, priority: 87, sentiment: 45 },
      { date: "2024-12-05", alignment: 45, priority: 88, sentiment: 42 },
      { date: "2024-12-25", alignment: 48, priority: 85, sentiment: 48 },
      { date: "2025-01-15", alignment: 42, priority: 83, sentiment: 45 }
    ],
    engagementCategory: "silent",
    relatedActionIds: [7]
  },
  {
    id: 8,
    dealId: 2,
    companyId: 2,
    name: "Daniel Lee",
    role: "Infrastructure Lead",
    avatar: sh8, // Male photo for male name
    status: "positive",
    alignment: 82,
    priority: 78,
    sentiment: 85,
    engagement: 90,
    costInterest: false,
    threatInterest: true,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 50,
      threatMitigation: 75,
      speedToValue: 82
    },
    summary: "Infrastructure decision maker. Aligned on technical requirements. Ready to proceed.",
    lastInteraction: {
      date: "3 days ago",
      summary: "Completed infrastructure assessment meeting"
    },
    trends: [
      { date: "2024-09-15", alignment: 62, priority: 58, sentiment: 55 },
      { date: "2024-10-05", alignment: 68, priority: 65, sentiment: 62 },
      { date: "2024-10-25", alignment: 72, priority: 72, sentiment: 58 },
      { date: "2024-11-15", alignment: 68, priority: 68, sentiment: 72 },
      { date: "2024-12-05", alignment: 78, priority: 75, sentiment: 78 },
      { date: "2024-12-25", alignment: 75, priority: 78, sentiment: 82 },
      { date: "2025-01-15", alignment: 82, priority: 80, sentiment: 85 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [12]
  },
  {
    id: 9,
    dealId: 2,
    companyId: 2,
    name: "Sandra Miller",
    role: "VP Engineering",
    avatar: sh9, // Female photo for female name
    status: "neutral",
    alignment: 68,
    priority: 65,
    sentiment: 70,
    engagement: 55,
    costInterest: true,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 72,
      threatMitigation: 45,
      speedToValue: 78
    },
    summary: "Engineering VP. Evaluating total cost of ownership. Needs ROI justification.",
    lastInteraction: {
      date: "1 week ago",
      summary: "Requested TCO analysis and comparison"
    },
    trends: [
      { date: "2024-10-15", alignment: 60, priority: 65, sentiment: 58 },
      { date: "2024-11-15", alignment: 63, priority: 68, sentiment: 62 },
      { date: "2024-12-15", alignment: 66, priority: 70, sentiment: 66 },
      { date: "2025-01-15", alignment: 68, priority: 72, sentiment: 68 }
    ],
    engagementCategory: "silent",
    relatedActionIds: [15]
  },
  {
    id: 10,
    dealId: 2,
    companyId: 2,
    name: "Ryan Cooper",
    role: "DevOps Director",
    avatar: sh3, // Male photo for male name
    status: "positive",
    alignment: 75,
    priority: 72,
    sentiment: 78,
    engagement: 85,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 45,
      threatMitigation: 55,
      speedToValue: 90
    },
    summary: "DevOps leader. Excited about automation capabilities. Strong technical advocate.",
    lastInteraction: {
      date: "5 days ago",
      summary: "Demo of automation features - very positive feedback"
    },
    trends: [
      { date: "2024-10-15", alignment: 65, priority: 70, sentiment: 60 },
      { date: "2024-11-15", alignment: 68, priority: 75, sentiment: 65 },
      { date: "2024-12-15", alignment: 72, priority: 78, sentiment: 72 },
      { date: "2025-01-15", alignment: 75, priority: 80, sentiment: 76 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: []
  },
  // Shopify (Deal ID: 3)
  {
    id: 11,
    dealId: 3,
    companyId: 3,
    name: "David Park",
    role: "Head of E-commerce",
    avatar: sh4, // Male photo for male name
    status: "positive",
    alignment: 82,
    priority: 78,
    sentiment: 80,
    engagement: 88,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 55,
      threatMitigation: 40,
      speedToValue: 88
    },
    summary: "Business owner of e-commerce platform. Confirmed budget for Q2. Strong supporter.",
    lastInteraction: {
      date: "2 days ago",
      summary: "Confirmed budget allocation and timeline"
    },
    trends: [
      { date: "2024-11-20", alignment: 75, priority: 82, sentiment: 72 },
      { date: "2024-12-15", alignment: 78, priority: 85, sentiment: 76 },
      { date: "2025-01-15", alignment: 82, priority: 88, sentiment: 80 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: []
  },
  {
    id: 12,
    dealId: 3,
    companyId: 3,
    name: "Maria Santos",
    role: "Legal Counsel",
    avatar: sh5, // Female photo for female name
    status: "neutral",
    alignment: 65,
    priority: 62,
    sentiment: 60,
    engagement: 48,
    costInterest: false,
    threatInterest: true,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 30,
      threatMitigation: 85,
      speedToValue: 25
    },
    summary: "Legal gatekeeper. Currently reviewing contract terms. Standard legal process.",
    lastInteraction: {
      date: "4 days ago",
      summary: "Sent contract redlines for review"
    },
    trends: [
      { date: "2024-11-20", alignment: 60, priority: 75, sentiment: 55 },
      { date: "2024-12-15", alignment: 62, priority: 78, sentiment: 58 },
      { date: "2025-01-15", alignment: 65, priority: 80, sentiment: 62 }
    ],
    engagementCategory: "silent",
    relatedActionIds: []
  },
  {
    id: 13,
    dealId: 3,
    companyId: 3,
    name: "John Miller",
    role: "COO",
    avatar: sh6, // Male photo for male name
    status: "positive",
    alignment: 75,
    priority: 72,
    sentiment: 78,
    engagement: 80,
    costInterest: true,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 68,
      threatMitigation: 45,
      speedToValue: 85
    },
    summary: "Operations leader. Supportive but wants faster implementation timeline.",
    lastInteraction: {
      date: "1 week ago",
      summary: "Discussed implementation timeline concerns"
    },
    trends: [
      { date: "2024-11-20", alignment: 70, priority: 78, sentiment: 68 },
      { date: "2024-12-15", alignment: 72, priority: 80, sentiment: 72 },
      { date: "2025-01-15", alignment: 75, priority: 82, sentiment: 76 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: []
  },
  // HubSpot (Deal ID: 4)
  {
    id: 14,
    dealId: 4,
    companyId: 4,
    name: "Jennifer Adams",
    role: "Marketing Director",
    avatar: sh1, // Female photo for female name
    status: "positive",
    alignment: 78,
    priority: 72,
    sentiment: 82,
    engagement: 89,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 45,
      threatMitigation: 35,
      speedToValue: 86
    },
    summary: "Marketing champion. Pushing for quick decision. Needs to build internal consensus.",
    lastInteraction: {
      date: "2 days ago",
      summary: "Strategy session on internal positioning"
    },
    trends: [
      { date: "2024-11-01", alignment: 70, priority: 83, sentiment: 68 },
      { date: "2024-12-01", alignment: 74, priority: 85, sentiment: 72 },
      { date: "2025-01-01", alignment: 76, priority: 87, sentiment: 78 },
      { date: "2025-01-15", alignment: 78, priority: 86, sentiment: 80 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [8, 9]
  },
  {
    id: 15,
    dealId: 4,
    companyId: 4,
    name: "Robert Kim",
    role: "CFO",
    avatar: sh8, // Male photo for male name
    status: "negative",
    alignment: 35,
    priority: 30,
    sentiment: 38,
    engagement: 35,
    costInterest: true,
    threatInterest: false,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 92,
      threatMitigation: 25,
      speedToValue: 35
    },
    summary: "Finance gatekeeper. Skeptical of investment. Needs strong business case.",
    lastInteraction: {
      date: "1 week ago",
      summary: "Requested detailed ROI analysis and competitor comparison"
    },
    trends: [
      { date: "2024-11-01", alignment: 42, priority: 70, sentiment: 40 },
      { date: "2024-12-01", alignment: 40, priority: 68, sentiment: 38 },
      { date: "2025-01-01", alignment: 38, priority: 65, sentiment: 35 },
      { date: "2025-01-15", alignment: 35, priority: 62, sentiment: 32 }
    ],
    engagementCategory: "silent",
    relatedActionIds: [14]
  },
  {
    id: 16,
    dealId: 4,
    companyId: 4,
    name: "Diana Ross",
    role: "CMO",
    avatar: sh7, // Female photo for female name
    status: "neutral",
    alignment: 58,
    priority: 55,
    sentiment: 60,
    engagement: 75,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 50,
      threatMitigation: 40,
      speedToValue: 75
    },
    summary: "Marketing executive. Sees strategic value. Needs to align with finance.",
    lastInteraction: {
      date: "5 days ago",
      summary: "Discussed strategic alignment with company goals"
    },
    trends: [
      { date: "2024-11-01", alignment: 52, priority: 65, sentiment: 50 },
      { date: "2024-12-01", alignment: 54, priority: 68, sentiment: 53 },
      { date: "2025-01-01", alignment: 56, priority: 70, sentiment: 56 },
      { date: "2025-01-15", alignment: 58, priority: 72, sentiment: 58 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: []
  },
  // Slack (Deal ID: 5)
  {
    id: 17,
    dealId: 5,
    companyId: 5,
    name: "Alex Thompson",
    role: "IT Director",
    avatar: sh2, // Male photo for male name
    status: "positive",
    alignment: 72,
    priority: 68,
    sentiment: 75,
    engagement: 82,
    costInterest: false,
    threatInterest: true,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 55,
      threatMitigation: 72,
      speedToValue: 80
    },
    summary: "IT leader. Confirmed pain points align with solution. Strong technical interest.",
    lastInteraction: {
      date: "3 days ago",
      summary: "Technical discovery call - positive feedback"
    },
    trends: [
      { date: "2025-01-05", alignment: 65, priority: 75, sentiment: 62 },
      { date: "2025-01-15", alignment: 72, priority: 80, sentiment: 70 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: []
  },
  {
    id: 18,
    dealId: 5,
    companyId: 5,
    name: "Lisa Chen",
    role: "Procurement Lead",
    avatar: sh9, // Female photo for female name
    status: "neutral",
    alignment: 55,
    priority: 52,
    sentiment: 58,
    engagement: 42,
    costInterest: true,
    threatInterest: false,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 85,
      threatMitigation: 45,
      speedToValue: 40
    },
    summary: "Procurement gatekeeper. Gathering requirements. Process-oriented approach.",
    lastInteraction: {
      date: "5 days ago",
      summary: "Initial requirements gathering call"
    },
    trends: [
      { date: "2025-01-05", alignment: 50, priority: 65, sentiment: 48 },
      { date: "2025-01-15", alignment: 55, priority: 70, sentiment: 55 }
    ],
    engagementCategory: "silent",
    relatedActionIds: []
  },
  {
    id: 19,
    dealId: 5,
    companyId: 5,
    name: "Peter Walsh",
    role: "VP Infrastructure",
    avatar: sh4, // Male photo for male name
    status: "neutral",
    alignment: 60,
    priority: 58,
    sentiment: 62,
    engagement: 48,
    costInterest: false,
    threatInterest: true,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 45,
      threatMitigation: 78,
      speedToValue: 55
    },
    summary: "Infrastructure VP. Evaluating alternatives. Needs more information.",
    lastInteraction: {
      date: "1 week ago",
      summary: "Initial introduction call"
    },
    trends: [
      { date: "2025-01-05", alignment: 55, priority: 60, sentiment: 52 },
      { date: "2025-01-15", alignment: 60, priority: 65, sentiment: 58 }
    ],
    engagementCategory: "silent",
    relatedActionIds: []
  },
  // Notion (Deal ID: 6)
  {
    id: 20,
    dealId: 6,
    companyId: 6,
    name: "Chris Martinez",
    role: "VP Product",
    avatar: sh3, // Male photo for male name
    status: "positive",
    alignment: 68,
    priority: 62,
    sentiment: 72,
    engagement: 78,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 40,
      threatMitigation: 35,
      speedToValue: 85
    },
    summary: "Product leader. Interested but lacks budget authority. Championing internally.",
    lastInteraction: {
      date: "4 days ago",
      summary: "Product capability discussion"
    },
    trends: [
      { date: "2024-12-10", alignment: 60, priority: 70, sentiment: 58 },
      { date: "2025-01-01", alignment: 64, priority: 75, sentiment: 65 },
      { date: "2025-01-15", alignment: 68, priority: 78, sentiment: 70 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [10]
  },
  {
    id: 21,
    dealId: 6,
    companyId: 6,
    name: "Amanda Lee",
    role: "Product Manager",
    avatar: sh5, // Female photo for female name
    status: "positive",
    alignment: 75,
    priority: 70,
    sentiment: 78,
    engagement: 88,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 35,
      threatMitigation: 30,
      speedToValue: 90
    },
    summary: "Product champion. Strong internal advocate. Limited decision authority.",
    lastInteraction: {
      date: "2 days ago",
      summary: "Feature deep-dive session"
    },
    trends: [
      { date: "2024-12-10", alignment: 68, priority: 75, sentiment: 65 },
      { date: "2025-01-01", alignment: 72, priority: 78, sentiment: 72 },
      { date: "2025-01-15", alignment: 75, priority: 80, sentiment: 76 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: [11]
  },
  {
    id: 22,
    dealId: 6,
    companyId: 6,
    name: "Steve Jobs Jr",
    role: "CEO",
    avatar: sh6, // Male photo for male name
    status: "negative",
    alignment: 28,
    priority: 25,
    sentiment: 32,
    engagement: 22,
    costInterest: true,
    threatInterest: false,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 75,
      threatMitigation: 50,
      speedToValue: 45
    },
    summary: "CEO. Skeptical of timing. Focused on other priorities. Needs executive-level value prop.",
    lastInteraction: {
      date: "2 weeks ago",
      summary: "Brief intro call - expressed timing concerns"
    },
    trends: [
      { date: "2024-12-10", alignment: 35, priority: 50, sentiment: 40 },
      { date: "2025-01-01", alignment: 32, priority: 45, sentiment: 35 },
      { date: "2025-01-15", alignment: 28, priority: 42, sentiment: 30 }
    ],
    engagementCategory: "hidden",
    relatedActionIds: []
  },
  // Figma (Deal ID: 7)
  {
    id: 23,
    dealId: 7,
    companyId: 7,
    name: "Kevin Brown",
    role: "Design Director",
    avatar: sh8, // Male photo for male name
    status: "positive",
    alignment: 72,
    priority: 68,
    sentiment: 78,
    engagement: 85,
    costInterest: false,
    threatInterest: false,
    speedInterest: true,
    buyerValueMap: {
      costReduction: 35,
      threatMitigation: 40,
      speedToValue: 88
    },
    summary: "Design leader. Excited about capabilities. Early stage exploration.",
    lastInteraction: {
      date: "3 days ago",
      summary: "Initial capability demo - very positive"
    },
    trends: [
      { date: "2025-01-10", alignment: 65, priority: 72, sentiment: 60 },
      { date: "2025-01-15", alignment: 72, priority: 78, sentiment: 68 }
    ],
    engagementCategory: "engaged",
    relatedActionIds: []
  },
  {
    id: 24,
    dealId: 7,
    companyId: 7,
    name: "Rachel Green",
    role: "Procurement Manager",
    avatar: sh7, // Female photo for female name
    status: "neutral",
    alignment: 45,
    priority: 42,
    sentiment: 48,
    engagement: 38,
    costInterest: true,
    threatInterest: false,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 82,
      threatMitigation: 40,
      speedToValue: 35
    },
    summary: "Procurement lead. Gathering initial requirements. Early stage process.",
    lastInteraction: {
      date: "1 week ago",
      summary: "Initial requirements gathering"
    },
    trends: [
      { date: "2025-01-10", alignment: 42, priority: 55, sentiment: 40 },
      { date: "2025-01-15", alignment: 45, priority: 60, sentiment: 45 }
    ],
    engagementCategory: "silent",
    relatedActionIds: []
  },
  {
    id: 25,
    dealId: 7,
    companyId: 7,
    name: "Monica Geller",
    role: "Finance Director",
    avatar: sh9, // Female photo for female name
    status: "neutral",
    alignment: 38,
    priority: 35,
    sentiment: 40,
    engagement: 25,
    costInterest: true,
    threatInterest: false,
    speedInterest: false,
    buyerValueMap: {
      costReduction: 88,
      threatMitigation: 35,
      speedToValue: 30
    },
    summary: "Finance gatekeeper. Not yet engaged. Will need strong business case.",
    lastInteraction: {
      date: "Not contacted yet",
      summary: "No direct interaction"
    },
    trends: [
      { date: "2025-01-10", alignment: 35, priority: 45, sentiment: 30 },
      { date: "2025-01-15", alignment: 38, priority: 48, sentiment: 35 }
    ],
    engagementCategory: "hidden",
    relatedActionIds: []
  }
];

// ==================== ACTIONS DATA ====================

export const actions: Action[] = [
  // Salesforce Actions
  {
    id: 1,
    dealId: 1,
    title: "Q4 Financial Review Preparation",
    stakeholderIds: [1],
    artifact: "ROI Calculator",
    basedOn: "Email from CFO requesting cost analysis",
    priority: "high",
    type: "email",
    deadline: "Today 5pm",
    status: "pending"
  },
  {
    id: 2,
    dealId: 1,
    title: "Implementation Timeline Discussion",
    stakeholderIds: [2],
    artifact: "Timeline Document",
    basedOn: "Meeting notes from last call",
    priority: "high",
    type: "meeting",
    deadline: "Tomorrow",
    status: "pending"
  },
  {
    id: 13,
    dealId: 1,
    title: "Executive Briefing Prep",
    stakeholderIds: [1, 3],
    artifact: "Slide Deck",
    basedOn: "Upcoming board meeting",
    priority: "high",
    type: "email",
    deadline: "Jan 25",
    status: "pending"
  },
  {
    id: 16,
    dealId: 1,
    title: "Technical Architecture Review",
    stakeholderIds: [3],
    artifact: "Architecture Document",
    basedOn: "CIO's technical requirements",
    priority: "medium",
    type: "meeting",
    deadline: "Jan 28",
    status: "pending"
  },
  // Stripe Actions
  {
    id: 3,
    dealId: 2,
    title: "Security Compliance Review",
    stakeholderIds: [4, 5],
    artifact: "Compliance Checklist",
    basedOn: "Security audit requirements",
    priority: "high",
    type: "email",
    deadline: "Jan 22",
    status: "pending"
  },
  {
    id: 4,
    dealId: 2,
    title: "API Integration Planning",
    stakeholderIds: [4],
    artifact: "Integration Guide",
    basedOn: "CTO's technical questions",
    priority: "high",
    type: "meeting",
    deadline: "Jan 23",
    status: "pending"
  },
  {
    id: 5,
    dealId: 2,
    title: "Security Documentation Package",
    stakeholderIds: [5],
    artifact: "Security Docs",
    basedOn: "Security Lead's request",
    priority: "high",
    type: "email",
    deadline: "Jan 24",
    status: "pending"
  },
  {
    id: 6,
    dealId: 2,
    title: "Engineering Team Demo",
    stakeholderIds: [6],
    artifact: "Demo Environment",
    basedOn: "VP Engineering's interest",
    priority: "medium",
    type: "meeting",
    deadline: "Jan 26",
    status: "pending"
  },
  {
    id: 7,
    dealId: 2,
    title: "GDPR Compliance Deep-Dive",
    stakeholderIds: [7],
    artifact: "DPA Document",
    basedOn: "DPO's compliance concerns",
    priority: "high",
    type: "meeting",
    deadline: "Jan 25",
    status: "pending"
  },
  {
    id: 12,
    dealId: 2,
    title: "Infrastructure Assessment Follow-up",
    stakeholderIds: [8],
    artifact: "Assessment Report",
    basedOn: "Infrastructure review meeting",
    priority: "medium",
    type: "email",
    deadline: "Jan 27",
    status: "pending"
  },
  {
    id: 15,
    dealId: 2,
    title: "TCO Analysis Presentation",
    stakeholderIds: [9],
    artifact: "TCO Calculator",
    basedOn: "VP Engineering's cost questions",
    priority: "medium",
    type: "meeting",
    deadline: "Jan 29",
    status: "pending"
  },
  // HubSpot Actions
  {
    id: 8,
    dealId: 4,
    title: "Marketing ROI Case Study",
    stakeholderIds: [14],
    artifact: "Case Study",
    basedOn: "Marketing Director's request",
    priority: "high",
    type: "email",
    deadline: "Jan 23",
    status: "pending"
  },
  {
    id: 9,
    dealId: 4,
    title: "Internal Champion Strategy",
    stakeholderIds: [14, 16],
    artifact: "Strategy Document",
    basedOn: "Need to build internal consensus",
    priority: "medium",
    type: "meeting",
    deadline: "Jan 24",
    status: "pending"
  },
  {
    id: 14,
    dealId: 4,
    title: "Financial Business Case",
    stakeholderIds: [15],
    artifact: "Business Case",
    basedOn: "CFO's skepticism",
    priority: "high",
    type: "email",
    deadline: "Jan 26",
    status: "pending"
  },
  // Notion Actions
  {
    id: 10,
    dealId: 6,
    title: "Product Capability Roadmap",
    stakeholderIds: [20],
    artifact: "Roadmap Document",
    basedOn: "VP Product's feature questions",
    priority: "medium",
    type: "email",
    deadline: "Jan 28",
    status: "pending"
  },
  {
    id: 11,
    dealId: 6,
    title: "Feature Deep-Dive Session",
    stakeholderIds: [21],
    artifact: "Feature Demo",
    basedOn: "Product Manager's interest",
    priority: "low",
    type: "meeting",
    deadline: "Jan 30",
    status: "pending"
  }
];

// ==================== HELPER FUNCTIONS ====================

export const getDealById = (id: number): Deal | undefined => 
  deals.find(deal => deal.id === id);

export const getStakeholdersForDeal = (dealId: number): Stakeholder[] => 
  stakeholders.filter(s => s.dealId === dealId);

export const getActionsForDeal = (dealId: number): Action[] => 
  actions.filter(a => a.dealId === dealId);

export const getActionsForStakeholder = (stakeholderId: number): Action[] => 
  actions.filter(a => a.stakeholderIds.includes(stakeholderId));

export const getStakeholderById = (id: number): Stakeholder | undefined => 
  stakeholders.find(s => s.id === id);

export const getActionById = (id: number): Action | undefined => 
  actions.find(a => a.id === id);

export const getAllDeals = (): Deal[] => deals;

export const getAllActions = (): Action[] => actions;

export const getAllStakeholders = (): Stakeholder[] => stakeholders;

export const getAllCompanyNames = (): string[] => companies.map(c => c.name);

export const getAllDealNames = (): string[] => deals.map(d => d.name);

export const getCompanyById = (id: number): Company | undefined => 
  companies.find(c => c.id === id);

export const getCompanyForDeal = (dealId: number): Company | undefined => {
  const deal = getDealById(dealId);
  return deal ? getCompanyById(deal.companyId) : undefined;
};

export const getDealsForCompany = (companyId: number): Deal[] => 
  deals.filter(d => d.companyId === companyId);

export const getProgressColor = (value: number): string => {
  if (value > 70) return "bg-green";
  if (value >= 50) return "bg-yellow";
  return "bg-red";
};

// Get HSL color string for charts based on score thresholds
export const getDonutColor = (value: number): string => {
  if (value > 70) return "hsl(var(--green))";
  if (value >= 50) return "hsl(var(--yellow))";
  return "hsl(var(--red))";
};

// Helper for trend indicator color based on value change
export const getTrendColor = (change: number): string => {
  if (change > 0) return "text-green";
  if (change < 0) return "text-red";
  return "text-yellow";
};

export const getStatusColor = (status: StakeholderStatus): string => {
  switch (status) {
    case "positive": return "bg-green text-white";
    case "neutral": return "bg-yellow text-foreground";
    case "negative": return "bg-red text-white";
    default: return "bg-muted text-foreground";
  }
};

// Helper to get action with populated stakeholder and company data
export interface ActionWithStakeholders extends Omit<Action, 'stakeholderIds'> {
  stakeholders: Stakeholder[];
  dealName: string;
  companyName: string;
  companyLogo: string;
  dealStage: DealStage;
  winProbability: number;
}

export const getActionWithStakeholders = (actionId: number): ActionWithStakeholders | undefined => {
  const action = getActionById(actionId);
  if (!action) return undefined;
  
  const deal = getDealById(action.dealId);
  if (!deal) return undefined;
  
  const company = getCompanyById(deal.companyId);
  if (!company) return undefined;
  
  const actionStakeholders = action.stakeholderIds
    .map(id => getStakeholderById(id))
    .filter((s): s is Stakeholder => s !== undefined);
  
  return {
    ...action,
    stakeholders: actionStakeholders,
    dealName: deal.name,
    companyName: company.name,
    companyLogo: company.logo,
    dealStage: deal.stage,
    winProbability: deal.winProbability
  };
};

export const getAllActionsWithStakeholders = (): ActionWithStakeholders[] => 
  actions
    .map(a => getActionWithStakeholders(a.id))
    .filter((a): a is ActionWithStakeholders => a !== undefined);
