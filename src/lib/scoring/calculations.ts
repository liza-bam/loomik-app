// ============= SCORING CALCULATIONS =============
// Core formulas for Win Probability & Alignment Scoring

import type { 
  DealSignals, 
  DealMetrics, 
  DealScoreResult, 
  StakeholderMetrics,
  StakeholderAlignmentResult,
  BudgetMentioned,
  ProblemSolutionMatch,
  NetSentiment,
  EngagementTrend
} from './types';

// Re-export the result type for use by other modules
export type { DealScoreResult, StakeholderAlignmentResult } from './types';

// ==================== CONSTANTS ====================

// 35% floor for all stakeholder metrics
const METRIC_FLOOR = 0.35;

// 97% ceiling for all metrics - never show 100%
const METRIC_CEILING = 0.97;

// Guardrail threshold - if any metric below this, flag it
const GUARDRAIL_THRESHOLD = 0.45;

// Role influence scores based on seniority
export const ROLE_INFLUENCE_SCORES: Record<string, number> = {
  'CEO': 95,
  'CFO': 90,
  'CTO': 88,
  'CIO': 85,
  'COO': 85,
  'VP': 80,
  'Vice President': 80,
  'Director': 70,
  'Head': 68,
  'Manager': 55,
  'Lead': 50,
  'Analyst': 40,
  'default': 50
};

// Required buying roles for coverage metric
const REQUIRED_ROLES = ['Champion', 'Economic Buyer', 'Technical', 'User'];

// ==================== FLOOR UTILITY ====================

/**
 * Apply 35% floor and 97% ceiling to a metric value
 * Ensures no metric displays below 35% or above 97%
 */
function applyFloor(rawValue: number): number {
  const floored = METRIC_FLOOR + (rawValue * (1 - METRIC_FLOOR));
  return Math.min(floored, METRIC_CEILING);
}

/**
 * Get influence score for a role
 */
export function getInfluenceScore(role: string): number {
  // Check for exact match first
  if (ROLE_INFLUENCE_SCORES[role]) {
    return ROLE_INFLUENCE_SCORES[role];
  }
  
  // Check for partial match
  for (const [key, score] of Object.entries(ROLE_INFLUENCE_SCORES)) {
    if (role.toLowerCase().includes(key.toLowerCase())) {
      return score;
    }
  }
  
  return ROLE_INFLUENCE_SCORES.default;
}

// ==================== NORMALIZATION HELPERS ====================

// Normalize budget mention to 0-1
function normalizeBudget(budget: BudgetMentioned): number {
  switch (budget) {
    case 'numeric': return 1.0;
    case 'range': return 0.5;
    case 'none': return 0.0;
  }
}

// Normalize problem-solution match to 0-1
function normalizeProblemMatch(match: ProblemSolutionMatch): number {
  switch (match) {
    case 'match': return 1.0;
    case 'partial': return 0.5;
    case 'mismatch': return 0.0;
  }
}

// Normalize sentiment to 0-1
function normalizeSentiment(sentiment: NetSentiment): number {
  switch (sentiment) {
    case 'positive': return 1.0;
    case 'neutral': return 0.5;
    case 'negative': return 0.0;
  }
}

// Normalize engagement trend to 0-1
function normalizeTrend(trend: EngagementTrend): number {
  switch (trend) {
    case 'up': return 1.0;
    case 'flat': return 0.5;
    case 'down': return 0.0;
  }
}

// ==================== METRIC CALCULATIONS ====================

/**
 * Calculate normalized metrics from raw signals
 * Win Probability now uses 3 metrics: Alignment, Consensus, Sentiment
 * All metrics have a 35% floor applied to prevent zero values
 */
export function calculateMetrics(signals: DealSignals): DealMetrics {
  // Alignment = strategic fit from problem-solution match and success criteria
  const matchValue = normalizeProblemMatch(signals.problemSolutionMatch);
  const criteriaValue = signals.successCriteriaDefined ? 1.0 : 0.0;
  const alignmentRaw = (matchValue + criteriaValue) / 2;
  const alignment = applyFloor(alignmentRaw);

  // Consensus = stakeholder agreement derived from sentiment, engagement trend, budget/deadline indicators
  const sentimentValue = normalizeSentiment(signals.netSentiment);
  const trendValue = normalizeTrend(signals.engagementTrend);
  const budgetValue = normalizeBudget(signals.budgetMentioned);
  const deadlineValue = signals.deadlineStated ? 1.0 : 0.0;
  // Weight: sentiment (40%), trend (30%), budget commitment (20%), timeline commitment (10%)
  const consensusRaw = (sentimentValue * 0.4) + (trendValue * 0.3) + (budgetValue * 0.2) + (deadlineValue * 0.1);
  const consensus = applyFloor(consensusRaw);

  // Sentiment = communication health from net sentiment and engagement trend
  const sentimentRaw = (sentimentValue + trendValue) / 2;
  const sentiment = applyFloor(sentimentRaw);

  return { alignment, consensus, sentiment };
}

/**
 * Calculate Win Probability with guardrail
 * Formula: 100 × (0.40A + 0.35C + 0.25S) - 3 metrics: Alignment, Consensus, Sentiment
 * Guardrail: If any metric < 0.30, cap at 49%
 */
export function calculateWinProbability(metrics: DealMetrics): { 
  winProbability: number; 
  isGuardrailActive: boolean;
  primaryRiskMetric: keyof DealMetrics | null;
} {
  const { alignment, consensus, sentiment } = metrics;
  
  // Check guardrail condition - 3 metrics
  const metricsArray: [keyof DealMetrics, number][] = [
    ['alignment', alignment],
    ['consensus', consensus],
    ['sentiment', sentiment]
  ];
  
  // Find the lowest metric
  let lowestMetric: keyof DealMetrics | null = null;
  let lowestValue = Infinity;
  let belowThreshold = false;
  
  for (const [name, value] of metricsArray) {
    if (value < lowestValue) {
      lowestValue = value;
      lowestMetric = name;
    }
    if (value < 0.30) {
      belowThreshold = true;
    }
  }

  // Calculate raw probability with new 3-metric weights: 40/35/25
  const rawProbability = 100 * (0.40 * alignment + 0.35 * consensus + 0.25 * sentiment);
  
  // Apply guardrail and cap at 97%
  let winProbability = belowThreshold ? Math.min(rawProbability, 49) : rawProbability;
  winProbability = Math.min(winProbability, 97); // Never show 100%

  return {
    winProbability: Math.round(winProbability),
    isGuardrailActive: belowThreshold,
    primaryRiskMetric: lowestMetric
  };
}

/**
 * Full deal scoring - calculate all metrics and win probability
 */
export function calculateDealScore(signals: DealSignals): DealScoreResult {
  const metrics = calculateMetrics(signals);
  const { winProbability, isGuardrailActive, primaryRiskMetric } = calculateWinProbability(metrics);

  return {
    winProbability,
    metrics,
    primaryRiskMetric,
    isGuardrailActive,
    rawSignals: signals
  };
}

// ==================== STAKEHOLDER CALCULATIONS ====================

export interface StakeholderAlignmentInput {
  stakeholders: Array<{
    id: number;
    name: string;
    role: string;
    alignment: number;         // 0-100 message fit score
    sentiment: number;         // 0-100 sentiment score
    engagementCategory: 'engaged' | 'silent' | 'hidden';
    status: 'positive' | 'neutral' | 'negative';
  }>;
}

/**
 * Determine if a stakeholder is an Economic Buyer
 */
function isEconomicBuyer(role: string): boolean {
  const ebRoles = ['CFO', 'CEO', 'VP Finance', 'Finance Director', 'COO'];
  return ebRoles.some(r => role.toLowerCase().includes(r.toLowerCase()));
}

/**
 * Check if a role covers a required buying role
 */
function coversRequiredRole(role: string): string | null {
  const roleLower = role.toLowerCase();
  
  // Champion detection (VP, Director level with positive sentiment)
  if (roleLower.includes('vp') || roleLower.includes('director') || roleLower.includes('head')) {
    return 'Champion';
  }
  
  // Economic buyer detection
  if (isEconomicBuyer(role)) {
    return 'Economic Buyer';
  }
  
  // Technical evaluator detection
  if (roleLower.includes('cto') || roleLower.includes('cio') || roleLower.includes('technical') || roleLower.includes('engineer') || roleLower.includes('architect')) {
    return 'Technical';
  }
  
  // End user detection
  if (roleLower.includes('manager') || roleLower.includes('analyst') || roleLower.includes('user') || roleLower.includes('lead')) {
    return 'User';
  }
  
  return null;
}

/**
 * Calculate stakeholder alignment with the new 3-metric system
 * Metrics: Capability, Message Fit, Value Translation
 * All metrics have a 35% floor applied
 */
export function calculateStakeholderAlignment(input: StakeholderAlignmentInput): StakeholderAlignmentResult {
  const { stakeholders } = input;
  
  if (stakeholders.length === 0) {
    return {
      alignmentScore: 35, // Floor value
      metrics: { 
        capability: METRIC_FLOOR, 
        messageFit: METRIC_FLOOR, 
        valueTranslation: METRIC_FLOOR 
      },
      primaryRiskMetric: 'capability',
      isGuardrailActive: true
    };
  }

  // 1. CAPABILITY - role coverage and technical match
  const coveredRoles = new Set<string>();
  stakeholders.forEach(s => {
    const role = coversRequiredRole(s.role);
    if (role) coveredRoles.add(role);
  });
  const roleCoverage = coveredRoles.size / REQUIRED_ROLES.length;
  const engagedStakeholders = stakeholders.filter(s => s.engagementCategory === 'engaged');
  const engagedRatio = engagedStakeholders.length / stakeholders.length;
  // Capability = role coverage (60%) + engagement ratio (40%)
  const capabilityRaw = (roleCoverage * 0.6) + (engagedRatio * 0.4);
  const capability = applyFloor(capabilityRaw);

  // 2. MESSAGE FIT - average alignment across stakeholders (shared understanding)
  const avgAlignment = stakeholders.reduce((sum, s) => sum + s.alignment, 0) / stakeholders.length / 100;
  const messageFit = applyFloor(avgAlignment);

  // 3. VALUE TRANSLATION - based on sentiment and value articulation indicators
  const economicBuyers = stakeholders.filter(s => isEconomicBuyer(s.role));
  const ebEngaged = economicBuyers.length > 0 && economicBuyers.some(s => s.engagementCategory === 'engaged');
  const positiveStakeholders = stakeholders.filter(s => s.status === 'positive').length;
  const positiveRatio = positiveStakeholders / stakeholders.length;
  // Influence scores indicate how well value is being received by decision-makers
  const influenceScores = engagedStakeholders.map(s => getInfluenceScore(s.role) / 100);
  const avgInfluence = influenceScores.length > 0 
    ? influenceScores.reduce((a, b) => a + b, 0) / influenceScores.length 
    : 0;
  // Value Translation = EB engagement (30%) + positive ratio (35%) + influence (35%)
  const valueTranslationRaw = (ebEngaged ? 0.3 : 0) + (positiveRatio * 0.35) + (avgInfluence * 0.35);
  const valueTranslation = applyFloor(valueTranslationRaw);

  // Find risk (lowest metric)
  const metrics: StakeholderMetrics = { capability, messageFit, valueTranslation };
  const metricsArray: [keyof StakeholderMetrics, number][] = [
    ['capability', capability],
    ['messageFit', messageFit],
    ['valueTranslation', valueTranslation]
  ];
  
  let lowestMetric: keyof StakeholderMetrics = 'capability';
  let lowestValue = Infinity;
  
  for (const [name, value] of metricsArray) {
    if (value < lowestValue) {
      lowestValue = value;
      lowestMetric = name;
    }
  }

  // Calculate alignment score = weighted average (cap at 97%)
  // Weights: 35% Capability, 35% Message Fit, 30% Value Translation
  const rawAlignmentScore = 100 * (
    0.35 * capability +
    0.35 * messageFit +
    0.30 * valueTranslation
  );
  const alignmentScore = Math.round(Math.min(rawAlignmentScore, 97));

  // Check guardrail - any metric below threshold
  const isGuardrailActive = metricsArray.some(([, value]) => value < GUARDRAIL_THRESHOLD);

  return {
    alignmentScore,
    metrics,
    primaryRiskMetric: lowestMetric,
    isGuardrailActive
  };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert a 0-1 metric to 0-100 percentage for display (capped at 97%)
 */
export function metricToPercent(value: number): number {
  return Math.min(Math.round(value * 100), 97);
}

/**
 * Get risk level based on metric value
 */
export function getMetricRiskLevel(value: number): 'low' | 'medium' | 'high' {
  if (value >= 0.70) return 'low';
  if (value >= 0.30) return 'medium';
  return 'high';
}
