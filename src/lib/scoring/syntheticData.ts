// ============= SYNTHETIC DATA GENERATION =============
// Archetype-based signal generation for realistic deal distributions

import type { 
  DealArchetype, 
  DealSignals, 
  ArchetypeConfig,
  BudgetMentioned,
  ProblemSolutionMatch,
  NetSentiment,
  EngagementTrend
} from './types';
import { 
  calculateDealScore, 
  calculateStakeholderAlignment,
  type DealScoreResult, 
  type StakeholderAlignmentResult,
  type StakeholderAlignmentInput
} from './calculations';

// Re-export stakeholder alignment
export { calculateStakeholderAlignment, type StakeholderAlignmentInput, type StakeholderAlignmentResult } from './calculations';

// ==================== ARCHETYPE CONFIGURATIONS ====================

export const ARCHETYPE_CONFIGS: Record<DealArchetype, ArchetypeConfig> = {
  champion: {
    name: 'champion',
    distribution: 0.15, // 15% of deals
    winProbRange: [75, 90],
    probabilities: {
      deadlineStated: 0.90,
      budgetNumeric: 0.80,
      budgetRange: 0.15,
      budgetNone: 0.05,
      costOfInaction: 0.85,
      problemMatch: 0.85,
      problemPartial: 0.12,
      problemMismatch: 0.03,
      successCriteria: 0.90,
      valueQuantified: 0.85,
      sentimentNegative: 0.05,
      sentimentNeutral: 0.25,
      sentimentPositive: 0.70,
      trendDown: 0.05,
      trendFlat: 0.20,
      trendUp: 0.75
    }
  },
  healthy: {
    name: 'healthy',
    distribution: 0.40, // 40% of deals
    winProbRange: [55, 74],
    probabilities: {
      deadlineStated: 0.70,
      budgetNumeric: 0.50,
      budgetRange: 0.35,
      budgetNone: 0.15,
      costOfInaction: 0.55,
      problemMatch: 0.60,
      problemPartial: 0.30,
      problemMismatch: 0.10,
      successCriteria: 0.65,
      valueQuantified: 0.60,
      sentimentNegative: 0.15,
      sentimentNeutral: 0.50,
      sentimentPositive: 0.35,
      trendDown: 0.20,
      trendFlat: 0.50,
      trendUp: 0.30
    }
  },
  'at-risk': {
    name: 'at-risk',
    distribution: 0.30, // 30% of deals
    winProbRange: [35, 54],
    probabilities: {
      deadlineStated: 0.45,
      budgetNumeric: 0.25,
      budgetRange: 0.35,
      budgetNone: 0.40,
      costOfInaction: 0.30,
      problemMatch: 0.30,
      problemPartial: 0.40,
      problemMismatch: 0.30,
      successCriteria: 0.35,
      valueQuantified: 0.30,
      sentimentNegative: 0.35,
      sentimentNeutral: 0.45,
      sentimentPositive: 0.20,
      trendDown: 0.40,
      trendFlat: 0.40,
      trendUp: 0.20
    }
  },
  stalled: {
    name: 'stalled',
    distribution: 0.15, // 15% of deals
    winProbRange: [10, 34],
    probabilities: {
      deadlineStated: 0.20,
      budgetNumeric: 0.10,
      budgetRange: 0.30,
      budgetNone: 0.60,
      costOfInaction: 0.15,
      problemMatch: 0.15,
      problemPartial: 0.35,
      problemMismatch: 0.50,
      successCriteria: 0.20,
      valueQuantified: 0.15,
      sentimentNegative: 0.60,
      sentimentNeutral: 0.30,
      sentimentPositive: 0.10,
      trendDown: 0.60,
      trendFlat: 0.30,
      trendUp: 0.10
    }
  }
};

// ==================== RANDOM UTILITIES ====================

/**
 * Returns true with given probability (0-1)
 */
function chance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Select from weighted options
 */
function weightedSelect<T>(options: { value: T; weight: number }[]): T {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const option of options) {
    cumulative += option.weight;
    if (rand < cumulative) {
      return option.value;
    }
  }
  
  return options[options.length - 1].value;
}

/**
 * Select a random archetype based on distribution
 */
export function selectArchetype(): DealArchetype {
  return weightedSelect([
    { value: 'champion' as DealArchetype, weight: ARCHETYPE_CONFIGS.champion.distribution },
    { value: 'healthy' as DealArchetype, weight: ARCHETYPE_CONFIGS.healthy.distribution },
    { value: 'at-risk' as DealArchetype, weight: ARCHETYPE_CONFIGS['at-risk'].distribution },
    { value: 'stalled' as DealArchetype, weight: ARCHETYPE_CONFIGS.stalled.distribution }
  ]);
}

// ==================== SIGNAL GENERATION ====================

/**
 * Generate deal signals based on archetype
 */
export function generateSignalsForArchetype(archetype: DealArchetype): DealSignals {
  const config = ARCHETYPE_CONFIGS[archetype];
  const probs = config.probabilities;

  return {
    deadlineStated: chance(probs.deadlineStated),
    budgetMentioned: weightedSelect<BudgetMentioned>([
      { value: 'numeric', weight: probs.budgetNumeric },
      { value: 'range', weight: probs.budgetRange },
      { value: 'none', weight: probs.budgetNone }
    ]),
    costOfInactionStated: chance(probs.costOfInaction),
    problemSolutionMatch: weightedSelect<ProblemSolutionMatch>([
      { value: 'match', weight: probs.problemMatch },
      { value: 'partial', weight: probs.problemPartial },
      { value: 'mismatch', weight: probs.problemMismatch }
    ]),
    successCriteriaDefined: chance(probs.successCriteria),
    valueQuantified: chance(probs.valueQuantified),
    netSentiment: weightedSelect<NetSentiment>([
      { value: 'positive', weight: probs.sentimentPositive },
      { value: 'neutral', weight: probs.sentimentNeutral },
      { value: 'negative', weight: probs.sentimentNegative }
    ]),
    engagementTrend: weightedSelect<EngagementTrend>([
      { value: 'up', weight: probs.trendUp },
      { value: 'flat', weight: probs.trendFlat },
      { value: 'down', weight: probs.trendDown }
    ])
  };
}

/**
 * Generate a complete deal score for an archetype
 */
export function generateDealScoreForArchetype(archetype: DealArchetype): DealScoreResult {
  const signals = generateSignalsForArchetype(archetype);
  return calculateDealScore(signals);
}

/**
 * Assign archetype based on existing deal characteristics
 * Useful for retrofitting archetypes to existing deals
 */
export function inferArchetypeFromWinProbability(winProbability: number): DealArchetype {
  if (winProbability >= 75) return 'champion';
  if (winProbability >= 55) return 'healthy';
  if (winProbability >= 35) return 'at-risk';
  return 'stalled';
}

/**
 * Generate signals that approximately match a target win probability
 * Uses archetype inference and regenerates until within range
 */
export function generateSignalsForTargetWinProb(targetWinProb: number, maxAttempts: number = 10): DealSignals {
  const archetype = inferArchetypeFromWinProbability(targetWinProb);
  const config = ARCHETYPE_CONFIGS[archetype];
  
  // Try to generate signals within the archetype's range
  for (let i = 0; i < maxAttempts; i++) {
    const signals = generateSignalsForArchetype(archetype);
    const result = calculateDealScore(signals);
    
    // Accept if within 15% of target
    if (Math.abs(result.winProbability - targetWinProb) <= 15) {
      return signals;
    }
  }
  
  // Fallback: return last generated signals
  return generateSignalsForArchetype(archetype);
}

// ==================== PRECOMPUTED DEAL SIGNALS ====================

// Pre-assigned archetypes for the 7 existing deals
export const DEAL_ARCHETYPES: Record<number, DealArchetype> = {
  1: 'champion',   // Salesforce - Enterprise Platform Expansion
  2: 'healthy',    // Stripe - Payment Infrastructure Upgrade
  3: 'healthy',    // Shopify - E-commerce Integration Suite
  4: 'at-risk',    // HubSpot - Marketing Automation Expansion
  5: 'at-risk',    // Slack - Enterprise Collaboration Platform
  6: 'stalled',    // Notion - Productivity Suite Rollout
  7: 'stalled'     // Figma - Design Tools Enterprise License
};

// Pre-generated signals for consistency across sessions
// These match the existing deal narratives
export const PRECOMPUTED_SIGNALS: Record<number, DealSignals> = {
  1: { // Salesforce - Champion (varied metrics for realism)
    deadlineStated: true,
    budgetMentioned: 'range', // Changed from numeric for variety
    costOfInactionStated: true,
    problemSolutionMatch: 'match',
    successCriteriaDefined: true,
    valueQuantified: true,
    netSentiment: 'positive',
    engagementTrend: 'flat' // Changed from up for variety
  },
  2: { // Stripe - Healthy
    deadlineStated: true,
    budgetMentioned: 'range',
    costOfInactionStated: true,
    problemSolutionMatch: 'match',
    successCriteriaDefined: true,
    valueQuantified: false,
    netSentiment: 'positive',
    engagementTrend: 'flat'
  },
  3: { // Shopify - Healthy
    deadlineStated: true,
    budgetMentioned: 'numeric',
    costOfInactionStated: false,
    problemSolutionMatch: 'partial',
    successCriteriaDefined: true,
    valueQuantified: true,
    netSentiment: 'neutral',
    engagementTrend: 'up'
  },
  4: { // HubSpot - At-Risk
    deadlineStated: true,
    budgetMentioned: 'range',
    costOfInactionStated: false,
    problemSolutionMatch: 'partial',
    successCriteriaDefined: false,
    valueQuantified: false,
    netSentiment: 'neutral',
    engagementTrend: 'flat'
  },
  5: { // Slack - At-Risk
    deadlineStated: false,
    budgetMentioned: 'none',
    costOfInactionStated: false,
    problemSolutionMatch: 'match',
    successCriteriaDefined: true,
    valueQuantified: false,
    netSentiment: 'neutral',
    engagementTrend: 'flat'
  },
  6: { // Notion - Stalled
    deadlineStated: false,
    budgetMentioned: 'none',
    costOfInactionStated: false,
    problemSolutionMatch: 'partial',
    successCriteriaDefined: false,
    valueQuantified: false,
    netSentiment: 'negative',
    engagementTrend: 'down'
  },
  7: { // Figma - Stalled
    deadlineStated: false,
    budgetMentioned: 'range',
    costOfInactionStated: false,
    problemSolutionMatch: 'partial',
    successCriteriaDefined: false,
    valueQuantified: false,
    netSentiment: 'neutral',
    engagementTrend: 'flat'
  }
};

/**
 * Get signals for a deal (precomputed or generated)
 */
export function getSignalsForDeal(dealId: number): DealSignals {
  if (PRECOMPUTED_SIGNALS[dealId]) {
    return PRECOMPUTED_SIGNALS[dealId];
  }
  
  // For unknown deals, generate based on archetype
  const archetype = DEAL_ARCHETYPES[dealId] || selectArchetype();
  return generateSignalsForArchetype(archetype);
}

/**
 * Get full score for a deal
 */
export function getScoreForDeal(dealId: number): DealScoreResult {
  const signals = getSignalsForDeal(dealId);
  return calculateDealScore(signals);
}
