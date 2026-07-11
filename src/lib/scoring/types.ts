// ============= SCORING TYPES =============
// Type definitions for the Win Probability & Alignment Scoring System

// Deal Archetypes for synthetic data generation
export type DealArchetype = 'champion' | 'healthy' | 'at-risk' | 'stalled';

// Budget mention types
export type BudgetMentioned = 'numeric' | 'range' | 'none';

// Problem-solution match types
export type ProblemSolutionMatch = 'match' | 'partial' | 'mismatch';

// Sentiment types
export type NetSentiment = 'negative' | 'neutral' | 'positive';

// Engagement trend types
export type EngagementTrend = 'down' | 'flat' | 'up';

// Raw Signals - Deal Level
export interface DealSignals {
  deadlineStated: boolean;
  budgetMentioned: BudgetMentioned;
  costOfInactionStated: boolean;
  problemSolutionMatch: ProblemSolutionMatch;
  successCriteriaDefined: boolean;
  valueQuantified: boolean;
  netSentiment: NetSentiment;
  engagementTrend: EngagementTrend;
}

// Normalized Metrics (0-1 scale) - Win Probability uses 3 metrics
export interface DealMetrics {
  alignment: number;     // Strategic fit - avg(problemSolutionMatch, successCriteria)
  consensus: number;     // Stakeholder agreement - derived from engagement and sentiment
  sentiment: number;     // Communication health - avg(netSentiment, engagementTrend)
}

// Scoring result with flags
export interface DealScoreResult {
  winProbability: number;
  metrics: DealMetrics;
  primaryRiskMetric: keyof DealMetrics | null; // The lowest metric
  isGuardrailActive: boolean; // True if any metric < 0.30
  rawSignals: DealSignals;
}

// Stakeholder-level metrics - Alignment uses 3 metrics
export interface StakeholderMetrics {
  capability: number;       // 0-1: Role coverage and technical match
  messageFit: number;       // 0-1: Shared understanding across stakeholders
  valueTranslation: number; // 0-1: ROI articulation and value quantification
}

// Stakeholder alignment result
export interface StakeholderAlignmentResult {
  alignmentScore: number;
  metrics: StakeholderMetrics;
  primaryRiskMetric: keyof StakeholderMetrics | null; // The lowest metric
  isGuardrailActive: boolean; // True if any metric < 0.45
}

// Archetype probability configuration
export interface ArchetypeProbabilities {
  deadlineStated: number;
  budgetNumeric: number;
  budgetRange: number;
  budgetNone: number;
  costOfInaction: number;
  problemMatch: number;
  problemPartial: number;
  problemMismatch: number;
  successCriteria: number;
  valueQuantified: number;
  sentimentNegative: number;
  sentimentNeutral: number;
  sentimentPositive: number;
  trendDown: number;
  trendFlat: number;
  trendUp: number;
}

// Archetype configuration
export interface ArchetypeConfig {
  name: DealArchetype;
  distribution: number; // Percentage of deals (0-1)
  winProbRange: [number, number]; // Expected win probability range
  probabilities: ArchetypeProbabilities;
}

// Metric labels for display - Win Probability (3 metrics)
export const METRIC_LABELS: Record<keyof DealMetrics, string> = {
  alignment: 'Alignment',
  consensus: 'Consensus',
  sentiment: 'Sentiment'
};

// Metric labels for display - Stakeholder Alignment (3 metrics)
export const STAKEHOLDER_METRIC_LABELS: Record<keyof StakeholderMetrics, string> = {
  capability: 'Capability',
  messageFit: 'Message Fit',
  valueTranslation: 'Value Translation'
};
