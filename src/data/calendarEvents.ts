// Persistent Calendar Events Data
// Single source of truth for all calendar events

import { getAllDealNames } from "./dealData";

export interface CalendarEventData {
  id: number;
  title: string;
  company: string;
  dealName: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  type: "call" | "meeting";
  date: Date;
  description?: string;
  location?: string;
}

// Comprehensive calendar events for January-February 2026
export const calendarEvents: CalendarEventData[] = [
  // January 2026
  // Week 1 (Jan 1-4)
  { id: 1, title: "New Year Pipeline Kickoff", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "10:00 - 11:00", status: "completed", type: "meeting", date: new Date(2026, 0, 2), description: "Reviewed Q1 pipeline priorities and resource allocation" },
  { id: 2, title: "Q1 Goals Alignment", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "14:00 - 15:00", status: "completed", type: "meeting", date: new Date(2026, 0, 2), description: "Aligned on quarterly targets with engineering team" },
  { id: 3, title: "Account Strategy Session", company: "Shopify", dealName: "E-commerce Integration Suite", time: "09:00 - 09:45", status: "completed", type: "call", date: new Date(2026, 0, 3), description: "Discussed expansion strategy with account team" },
  
  // Week 2 (Jan 5-11)
  { id: 4, title: "Weekly Sales Standup", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "09:00 - 09:30", status: "completed", type: "meeting", date: new Date(2026, 0, 6), description: "Regular team sync on deal progress" },
  { id: 5, title: "Discovery Call - New Lead", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "11:00 - 11:45", status: "completed", type: "call", date: new Date(2026, 0, 6), description: "Initial discovery with marketing team" },
  { id: 6, title: "Product Demo Prep", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "14:00 - 14:30", status: "completed", type: "meeting", date: new Date(2026, 0, 7), description: "Prepared demo environment and materials" },
  { id: 7, title: "Technical Requirements Review", company: "Notion", dealName: "Productivity Suite Rollout", time: "10:00 - 11:00", status: "completed", type: "meeting", date: new Date(2026, 0, 7), description: "Reviewed integration requirements with IT" },
  { id: 8, title: "Champion Check-in", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "15:00 - 15:30", status: "completed", type: "call", date: new Date(2026, 0, 8), description: "Quick sync with Sarah Williams on deal status" },
  { id: 9, title: "Competitive Analysis Brief", company: "Shopify", dealName: "E-commerce Integration Suite", time: "11:00 - 11:30", status: "completed", type: "meeting", date: new Date(2026, 0, 9), description: "Presented competitive differentiation" },
  { id: 10, title: "Proposal Draft Review", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "14:00 - 15:00", status: "completed", type: "meeting", date: new Date(2026, 0, 9), description: "Internal review of proposal draft" },
  { id: 11, title: "End of Week Pipeline Review", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "16:00 - 16:30", status: "completed", type: "call", date: new Date(2026, 0, 10), description: "Weekly pipeline status update" },
  
  // Week 3 (Jan 12-18)
  { id: 12, title: "Account Planning Session", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "09:30 - 10:30", status: "completed", type: "meeting", date: new Date(2026, 0, 13), description: "Quarterly account strategy planning" },
  { id: 13, title: "Stakeholder Mapping Call", company: "Notion", dealName: "Productivity Suite Rollout", time: "11:00 - 11:45", status: "completed", type: "call", date: new Date(2026, 0, 13), description: "Identified key decision makers and influencers" },
  { id: 14, title: "Product Demo", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "14:00 - 15:00", status: "completed", type: "meeting", date: new Date(2026, 0, 14), description: "Full platform demo for executive team" },
  { id: 15, title: "Security Assessment Call", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "10:00 - 10:45", status: "completed", type: "call", date: new Date(2026, 0, 14), description: "Security questionnaire review with IT security" },
  { id: 16, title: "Budget Discussion", company: "Shopify", dealName: "E-commerce Integration Suite", time: "15:00 - 15:45", status: "completed", type: "meeting", date: new Date(2026, 0, 15), description: "Budget allocation discussion with finance" },
  { id: 17, title: "ROI Workshop", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "11:00 - 12:00", status: "completed", type: "meeting", date: new Date(2026, 0, 15), description: "Interactive ROI calculation session" },
  { id: 18, title: "Integration Planning", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "14:00 - 14:45", status: "completed", type: "call", date: new Date(2026, 0, 16), description: "Technical integration roadmap discussion" },
  { id: 19, title: "Executive Briefing Prep", company: "Notion", dealName: "Productivity Suite Rollout", time: "09:00 - 09:30", status: "completed", type: "meeting", date: new Date(2026, 0, 16), description: "Prepared materials for CEO briefing" },
  { id: 20, title: "Weekly Forecast Call", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "16:00 - 16:30", status: "completed", type: "call", date: new Date(2026, 0, 17), description: "Updated forecast and commit status" },
  { id: 21, title: "Design Review Meeting", company: "Figma", dealName: "Design Tools Enterprise License", time: "10:00 - 10:45", status: "completed", type: "meeting", date: new Date(2026, 0, 17), description: "Reviewed design tool requirements" },
  
  // Week 4 (Jan 19-25) - Current Week
  { id: 22, title: "Pipeline Strategy Meeting", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "09:00 - 10:00", status: "completed", type: "meeting", date: new Date(2026, 0, 20), description: "Q1 pipeline strategy and priorities" },
  { id: 23, title: "Legal Review Call", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "11:00 - 11:30", status: "completed", type: "call", date: new Date(2026, 0, 20), description: "Contract terms review with legal" },
  { id: 24, title: "Design System Discussion", company: "Figma", dealName: "Design Tools Enterprise License", time: "14:00 - 14:45", status: "completed", type: "meeting", date: new Date(2026, 0, 20), description: "Design system integration discussion" },
  { id: 25, title: "Pre-commit Call with CFO", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "14:00 - 14:30", status: "completed", type: "call", date: new Date(2026, 0, 21), description: "Addressed final CFO concerns" },
  { id: 26, title: "Team Standup", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "09:00 - 09:15", status: "completed", type: "meeting", date: new Date(2026, 0, 21), description: "Daily team sync" },
  { id: 27, title: "Pricing Review with Finance", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "10:00 - 10:30", status: "completed", type: "meeting", date: new Date(2026, 0, 21), description: "Pricing model discussion" },
  { id: 28, title: "Security Questionnaire Sync", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "12:00 - 12:30", status: "completed", type: "meeting", date: new Date(2026, 0, 21), description: "Security compliance review" },
  { id: 29, title: "Implementation Timeline Discussion", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "15:00 - 15:45", status: "completed", type: "meeting", date: new Date(2026, 0, 21), description: "Detailed implementation planning" },
  
  // Today (Jan 22, 2026)
  { id: 30, title: "Technical Deep Dive", company: "Shopify", dealName: "E-commerce Integration Suite", time: "11:00 - 11:45", status: "scheduled", type: "call", date: new Date(2026, 0, 22), description: "Deep dive into technical architecture" },
  { id: 31, title: "Legal Terms Review", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "14:00 - 15:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 22), description: "Final contract terms discussion" },
  { id: 32, title: "Workspace Setup Call", company: "Notion", dealName: "Productivity Suite Rollout", time: "09:30 - 10:00", status: "scheduled", type: "call", date: new Date(2026, 0, 22), description: "Workspace configuration planning" },
  
  // Future events (Jan 23-31)
  { id: 33, title: "Champion Alignment Call", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "10:00 - 10:30", status: "scheduled", type: "call", date: new Date(2026, 0, 23), description: "Sync with VP Operations on next steps" },
  { id: 34, title: "Product Demo", company: "Notion", dealName: "Productivity Suite Rollout", time: "14:00 - 15:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 23), description: "Demo for product team" },
  { id: 35, title: "Contract Negotiation", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "09:30 - 10:30", status: "scheduled", type: "meeting", date: new Date(2026, 0, 24), description: "Final contract negotiation" },
  { id: 36, title: "CFO Budget Discussion", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "15:00 - 15:45", status: "scheduled", type: "call", date: new Date(2026, 0, 24), description: "Budget approval discussion" },
  { id: 37, title: "Weekly Pipeline Review", company: "Shopify", dealName: "E-commerce Integration Suite", time: "09:00 - 09:45", status: "scheduled", type: "meeting", date: new Date(2026, 0, 27), description: "Weekly pipeline status" },
  { id: 38, title: "Integration Architecture Review", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "11:00 - 12:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 27), description: "Technical architecture review" },
  { id: 39, title: "Stakeholder Roundtable", company: "Notion", dealName: "Productivity Suite Rollout", time: "14:00 - 15:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 27), description: "Multi-stakeholder alignment" },
  { id: 40, title: "Quarterly Business Review", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "14:00 - 15:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 28), description: "QBR with executive team" },
  { id: 41, title: "Security Compliance Check", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "10:00 - 10:45", status: "scheduled", type: "call", date: new Date(2026, 0, 28), description: "Compliance verification" },
  { id: 42, title: "Pricing Finalization", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "15:00 - 15:30", status: "scheduled", type: "meeting", date: new Date(2026, 0, 28), description: "Final pricing agreement" },
  { id: 43, title: "Executive Briefing", company: "Notion", dealName: "Productivity Suite Rollout", time: "11:00 - 11:45", status: "scheduled", type: "meeting", date: new Date(2026, 0, 29), description: "CEO briefing session" },
  { id: 44, title: "Procurement Process Call", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "14:00 - 14:30", status: "scheduled", type: "call", date: new Date(2026, 0, 29), description: "Procurement timeline alignment" },
  { id: 45, title: "Technical Validation", company: "Shopify", dealName: "E-commerce Integration Suite", time: "09:30 - 10:15", status: "scheduled", type: "call", date: new Date(2026, 0, 29), description: "Technical requirements validation" },
  { id: 46, title: "Budget Approval Follow-up", company: "Notion", dealName: "Productivity Suite Rollout", time: "10:00 - 10:30", status: "scheduled", type: "call", date: new Date(2026, 0, 30), description: "Follow up on budget status" },
  { id: 47, title: "Final Proposal Review", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "15:00 - 16:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 30), description: "Final proposal walkthrough" },
  { id: 48, title: "Month-End Close Call", company: "Shopify", dealName: "E-commerce Integration Suite", time: "16:00 - 16:30", status: "scheduled", type: "call", date: new Date(2026, 0, 31), description: "Month-end deal status" },
  { id: 49, title: "Contract Signing Prep", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "11:00 - 11:30", status: "scheduled", type: "meeting", date: new Date(2026, 0, 31), description: "Prepare contract signing" },
  { id: 50, title: "Pilot Kickoff Planning", company: "Figma", dealName: "Design Tools Enterprise License", time: "14:00 - 15:00", status: "scheduled", type: "meeting", date: new Date(2026, 0, 31), description: "Plan pilot program" },
  
  // February 2026
  { id: 51, title: "February Kickoff Meeting", company: "Stripe", dealName: "Payment Infrastructure Upgrade", time: "09:00 - 10:00", status: "scheduled", type: "meeting", date: new Date(2026, 1, 2), description: "February planning session" },
  { id: 52, title: "New Quarter Planning", company: "HubSpot", dealName: "Marketing Automation Expansion", time: "14:00 - 15:00", status: "scheduled", type: "meeting", date: new Date(2026, 1, 2), description: "Q1 execution planning" },
  { id: 53, title: "Deal Review Session", company: "Shopify", dealName: "E-commerce Integration Suite", time: "11:00 - 11:45", status: "scheduled", type: "call", date: new Date(2026, 1, 3), description: "Deal status review" },
  { id: 54, title: "Implementation Roadmap", company: "Salesforce", dealName: "Enterprise Platform Expansion", time: "10:00 - 11:00", status: "scheduled", type: "meeting", date: new Date(2026, 1, 4), description: "Implementation planning" },
  { id: 55, title: "Renewal Discussion", company: "Slack", dealName: "Enterprise Collaboration Platform", time: "14:00 - 14:30", status: "scheduled", type: "call", date: new Date(2026, 1, 4), description: "Early renewal discussion" },
];

// Helper to get events for a specific date
export const getEventsForDate = (date: Date, selectedDeals: string[]): CalendarEventData[] => {
  return calendarEvents.filter(
    (e) =>
      e.date.toDateString() === date.toDateString() &&
      selectedDeals.includes(e.dealName)
  );
};

// Helper to check if date has events
export const hasEventsOnDate = (date: Date, selectedDeals: string[]): boolean => {
  return calendarEvents.some(
    (e) =>
      e.date.toDateString() === date.toDateString() &&
      selectedDeals.includes(e.dealName)
  );
};
