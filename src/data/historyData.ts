// Persistent History Data
// Single source of truth for timeline events and completed activities

import { deals, getStakeholdersForDeal, getCompanyById } from "./dealData";

export type TimelineEventType = "call" | "email" | "meeting" | "proposal" | "demo";

export interface TimelineEvent {
  id: number;
  dealId: number;
  dealName: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: string;
  time: string;
  stakeholders: string[];
  stakeholderTeam: string;
  sentiment: "positive" | "neutral" | "pending";
  priority: "high" | "medium" | "low";
  nextAction?: string;
}

// Persistent timeline events - realistic sales activity history
export const timelineEvents: TimelineEvent[] = [
  // Salesforce - Enterprise Platform Expansion
  {
    id: 1,
    dealId: 1,
    dealName: "Salesforce",
    type: "call",
    title: "Discovery Call - Sarah Williams",
    description: "Initial discovery with VP Operations to understand current pain points and operational challenges. Sarah expressed strong interest in our platform's automation capabilities.",
    date: "2026-01-21",
    time: "2:30 PM",
    stakeholders: ["Sarah Williams"],
    stakeholderTeam: "VP Operations",
    sentiment: "positive",
    priority: "high",
    nextAction: "Schedule technical deep-dive with IT team"
  },
  {
    id: 2,
    dealId: 1,
    dealName: "Salesforce",
    type: "meeting",
    title: "Executive Review - Tom Richards",
    description: "Presented platform capabilities to CIO. Technical requirements approved. Tom aligned on architecture approach and integration strategy.",
    date: "2026-01-18",
    time: "10:00 AM",
    stakeholders: ["Tom Richards"],
    stakeholderTeam: "CIO",
    sentiment: "positive",
    priority: "high",
    nextAction: "Send implementation timeline"
  },
  {
    id: 3,
    dealId: 1,
    dealName: "Salesforce",
    type: "email",
    title: "ROI Analysis Delivered - Michael Chen",
    description: "Sent comprehensive ROI analysis addressing CFO's budget concerns. Included 3-year TCO comparison and expected cost savings breakdown.",
    date: "2026-01-15",
    time: "3:15 PM",
    stakeholders: ["Michael Chen"],
    stakeholderTeam: "CFO",
    sentiment: "neutral",
    priority: "high",
    nextAction: "Follow up on ROI feedback"
  },
  {
    id: 4,
    dealId: 1,
    dealName: "Salesforce",
    type: "proposal",
    title: "Comprehensive Proposal Submitted",
    description: "Submitted detailed proposal with pricing, implementation timeline, and success metrics. Addressed all requirements from technical review.",
    date: "2026-01-10",
    time: "11:00 AM",
    stakeholders: ["Sarah Williams", "Tom Richards"],
    stakeholderTeam: "Decision Makers",
    sentiment: "positive",
    priority: "high",
    nextAction: "Schedule proposal review meeting"
  },
  
  // Stripe - Payment Infrastructure Upgrade
  {
    id: 5,
    dealId: 2,
    dealName: "Stripe",
    type: "meeting",
    title: "Security Deep-dive - Patricia Wong",
    description: "Conducted detailed security review with DPO. Addressed GDPR compliance questions and data residency requirements. Security assessment passed.",
    date: "2026-01-20",
    time: "9:00 AM",
    stakeholders: ["Patricia Wong"],
    stakeholderTeam: "DPO",
    sentiment: "positive",
    priority: "high",
    nextAction: "Send compliance documentation"
  },
  {
    id: 6,
    dealId: 2,
    dealName: "Stripe",
    type: "demo",
    title: "Platform Walkthrough - James Kumar",
    description: "Full platform demo for CTO showing integration capabilities and API architecture. James expressed enthusiasm about technical fit.",
    date: "2026-01-17",
    time: "2:00 PM",
    stakeholders: ["James Kumar"],
    stakeholderTeam: "CTO",
    sentiment: "positive",
    priority: "high",
    nextAction: "Provide API documentation"
  },
  {
    id: 7,
    dealId: 2,
    dealName: "Stripe",
    type: "call",
    title: "Budget Discussion - Rachel Green",
    description: "Discussed budget allocation with Finance Director. Confirmed Q2 budget availability. Rachel needs internal approval for final sign-off.",
    date: "2026-01-14",
    time: "11:30 AM",
    stakeholders: ["Rachel Green"],
    stakeholderTeam: "Finance Director",
    sentiment: "neutral",
    priority: "medium",
    nextAction: "Follow up on budget approval"
  },
  
  // Shopify - E-commerce Integration Suite
  {
    id: 8,
    dealId: 3,
    dealName: "Shopify",
    type: "meeting",
    title: "Technical Requirements Review - Chris Martinez",
    description: "Reviewed integration requirements with Head of Engineering. Strong technical alignment. Chris is championing internally with his team.",
    date: "2026-01-19",
    time: "10:30 AM",
    stakeholders: ["Chris Martinez"],
    stakeholderTeam: "Head of Engineering",
    sentiment: "positive",
    priority: "high",
    nextAction: "Schedule integration planning session"
  },
  {
    id: 9,
    dealId: 3,
    dealName: "Shopify",
    type: "email",
    title: "Contract Terms Review - Amanda Foster",
    description: "Sent updated contract terms addressing legal counsel's feedback. Amanda reviewing revised liability and SLA clauses.",
    date: "2026-01-16",
    time: "4:00 PM",
    stakeholders: ["Amanda Foster"],
    stakeholderTeam: "Legal Counsel",
    sentiment: "neutral",
    priority: "medium",
    nextAction: "Await legal feedback"
  },
  {
    id: 10,
    dealId: 3,
    dealName: "Shopify",
    type: "call",
    title: "Implementation Timeline - John Miller",
    description: "Discussed accelerated deployment options with COO. John wants implementation complete before Q3 product launch.",
    date: "2026-01-12",
    time: "9:00 AM",
    stakeholders: ["John Miller"],
    stakeholderTeam: "COO",
    sentiment: "positive",
    priority: "high",
    nextAction: "Prepare accelerated timeline proposal"
  },
  
  // HubSpot - Marketing Automation Expansion
  {
    id: 11,
    dealId: 4,
    dealName: "HubSpot",
    type: "meeting",
    title: "Business Case Development - Jennifer Adams",
    description: "Working session with Marketing Director to build ROI case for CFO. Identified key metrics and projected campaign improvements.",
    date: "2026-01-18",
    time: "1:00 PM",
    stakeholders: ["Jennifer Adams"],
    stakeholderTeam: "Marketing Director",
    sentiment: "positive",
    priority: "high",
    nextAction: "Finalize business case document"
  },
  {
    id: 12,
    dealId: 4,
    dealName: "HubSpot",
    type: "call",
    title: "Budget Concerns - David Park",
    description: "Addressed CFO's budget concerns. David requesting additional cost breakdown and competitor pricing comparison.",
    date: "2026-01-14",
    time: "3:30 PM",
    stakeholders: ["David Park"],
    stakeholderTeam: "CFO",
    sentiment: "neutral",
    priority: "high",
    nextAction: "Send competitive analysis"
  },
  {
    id: 13,
    dealId: 4,
    dealName: "HubSpot",
    type: "email",
    title: "CMO Engagement Update",
    description: "CMO confirmed strategic value of solution. Emailed endorsement to CFO. Momentum building internally.",
    date: "2026-01-11",
    time: "10:00 AM",
    stakeholders: ["Jennifer Adams"],
    stakeholderTeam: "Marketing Team",
    sentiment: "positive",
    priority: "medium",
    nextAction: "Schedule follow-up with CFO"
  },
  
  // Slack - Enterprise Collaboration Platform
  {
    id: 14,
    dealId: 5,
    dealName: "Slack",
    type: "demo",
    title: "Product Demo - Peter Walsh",
    description: "Demonstrated collaboration features to IT Director. Strong interest in integration capabilities with existing tools.",
    date: "2026-01-17",
    time: "11:00 AM",
    stakeholders: ["Peter Walsh"],
    stakeholderTeam: "IT Director",
    sentiment: "positive",
    priority: "medium",
    nextAction: "Send integration documentation"
  },
  {
    id: 15,
    dealId: 5,
    dealName: "Slack",
    type: "call",
    title: "Procurement Discovery - Lisa Chen",
    description: "Initial call with Procurement Lead to understand buying process. Lisa outlined 6-week procurement timeline.",
    date: "2026-01-13",
    time: "2:00 PM",
    stakeholders: ["Lisa Chen"],
    stakeholderTeam: "Procurement Lead",
    sentiment: "neutral",
    priority: "medium",
    nextAction: "Prepare vendor registration documents"
  },
  {
    id: 16,
    dealId: 5,
    dealName: "Slack",
    type: "meeting",
    title: "Infrastructure Assessment - Mike Thompson",
    description: "Technical meeting with VP Infrastructure. Evaluated alternatives and fit with current architecture.",
    date: "2026-01-09",
    time: "9:30 AM",
    stakeholders: ["Mike Thompson"],
    stakeholderTeam: "VP Infrastructure",
    sentiment: "neutral",
    priority: "medium",
    nextAction: "Address infrastructure concerns"
  },
  
  // Notion - Productivity Suite Rollout
  {
    id: 17,
    dealId: 6,
    dealName: "Notion",
    type: "meeting",
    title: "Executive Summary Presentation - Steve Jobs Jr",
    description: "Presented strategic value proposition to CEO. Steve questioning timing given other priorities. Needs stronger alignment story.",
    date: "2026-01-16",
    time: "10:00 AM",
    stakeholders: ["Steve Jobs Jr"],
    stakeholderTeam: "CEO",
    sentiment: "neutral",
    priority: "high",
    nextAction: "Develop strategic alignment document"
  },
  {
    id: 18,
    dealId: 6,
    dealName: "Notion",
    type: "call",
    title: "Champion Building - Alex Rivera",
    description: "Strategy call with Product Manager who is championing internally. Alex building case for product team adoption.",
    date: "2026-01-13",
    time: "4:00 PM",
    stakeholders: ["Alex Rivera"],
    stakeholderTeam: "Product Manager",
    sentiment: "positive",
    priority: "medium",
    nextAction: "Provide case studies"
  },
  {
    id: 19,
    dealId: 6,
    dealName: "Notion",
    type: "email",
    title: "Budget Cycle Information",
    description: "Received update on budget cycle. Current fiscal year budget already allocated. Q2 budget planning begins in March.",
    date: "2026-01-08",
    time: "11:30 AM",
    stakeholders: ["Alex Rivera"],
    stakeholderTeam: "Product Team",
    sentiment: "pending",
    priority: "low",
    nextAction: "Plan for Q2 budget cycle"
  },
  
  // Figma - Design Tools Enterprise License
  {
    id: 20,
    dealId: 7,
    dealName: "Figma",
    type: "demo",
    title: "Capability Demo - Kevin Brown",
    description: "Demonstrated design collaboration features to Design Director. Kevin excited about team workflow improvements.",
    date: "2026-01-15",
    time: "2:30 PM",
    stakeholders: ["Kevin Brown"],
    stakeholderTeam: "Design Director",
    sentiment: "positive",
    priority: "medium",
    nextAction: "Schedule design team workshop"
  },
  {
    id: 21,
    dealId: 7,
    dealName: "Figma",
    type: "call",
    title: "Requirements Gathering - Emily Zhang",
    description: "Initial requirements call with Procurement Manager. Emily gathering preliminary info for vendor evaluation.",
    date: "2026-01-10",
    time: "9:00 AM",
    stakeholders: ["Emily Zhang"],
    stakeholderTeam: "Procurement Manager",
    sentiment: "neutral",
    priority: "low",
    nextAction: "Submit vendor questionnaire"
  },
  {
    id: 22,
    dealId: 7,
    dealName: "Figma",
    type: "email",
    title: "Introduction Email - Robert Taylor",
    description: "Sent introduction email to Finance Director. No response yet. Need to engage through Design Director.",
    date: "2026-01-06",
    time: "10:00 AM",
    stakeholders: ["Robert Taylor"],
    stakeholderTeam: "Finance Director",
    sentiment: "pending",
    priority: "low",
    nextAction: "Follow up through Kevin Brown"
  },
  
  // Additional cross-deal activities
  {
    id: 23,
    dealId: 1,
    dealName: "Salesforce",
    type: "call",
    title: "Weekly Sync - Sarah Williams",
    description: "Regular check-in with champion. Sarah confirmed strong internal momentum. CFO meeting scheduled for next week.",
    date: "2026-01-07",
    time: "3:00 PM",
    stakeholders: ["Sarah Williams"],
    stakeholderTeam: "VP Operations",
    sentiment: "positive",
    priority: "high",
    nextAction: "Prepare for CFO meeting"
  },
  {
    id: 24,
    dealId: 2,
    dealName: "Stripe",
    type: "proposal",
    title: "Technical Proposal Submitted",
    description: "Submitted technical proposal with integration architecture and implementation plan. CTO reviewing with engineering team.",
    date: "2026-01-08",
    time: "4:30 PM",
    stakeholders: ["James Kumar"],
    stakeholderTeam: "CTO",
    sentiment: "positive",
    priority: "high",
    nextAction: "Schedule technical Q&A session"
  },
  {
    id: 25,
    dealId: 3,
    dealName: "Shopify",
    type: "meeting",
    title: "Stakeholder Alignment Session",
    description: "Multi-stakeholder meeting to align on project scope and success criteria. Good cross-functional alignment achieved.",
    date: "2026-01-06",
    time: "11:00 AM",
    stakeholders: ["John Miller", "Chris Martinez"],
    stakeholderTeam: "Leadership Team",
    sentiment: "positive",
    priority: "high",
    nextAction: "Document success criteria"
  },
];

// Helper to get all unique participants
export const getAllParticipants = (): string[] => {
  return [...new Set(timelineEvents.flatMap(e => e.stakeholders))];
};

// Helper to filter timeline events
export const filterTimelineEvents = (
  dealId: number | null,
  participant: string,
  searchQuery: string
): TimelineEvent[] => {
  return timelineEvents.filter(event => {
    if (dealId && event.dealId !== dealId) return false;
    if (participant !== "all" && !event.stakeholders.some(s => s.toLowerCase().includes(participant.toLowerCase()))) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
};
