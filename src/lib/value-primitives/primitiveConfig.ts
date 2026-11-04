// Primitive Configuration - Icons, Colors, and Display Properties

import type { ValuePrimitiveId } from './types';

export interface PrimitiveDisplayConfig {
  iconName: string;
  colorClass: string; // Tailwind color class for the primitive
  bgClass: string; // Background color class
  borderClass: string; // Border color class
  gradientFrom: string;
  gradientTo: string;
}

// All primitives share the same neutral styling (categories are neutral, see docs/design-tokens.md);
// only the icon tells them apart.
const NEUTRAL = {
  colorClass: 'text-muted-foreground',
  bgClass: 'bg-muted',
  borderClass: 'border-border',
  gradientFrom: 'from-muted',
  gradientTo: 'to-transparent',
};

// Display configuration for each primitive
export const PRIMITIVE_DISPLAY_CONFIG: Record<ValuePrimitiveId, PrimitiveDisplayConfig> = {
  revenue_growth: { iconName: 'TrendingUp', ...NEUTRAL },
  cost_efficiency: { iconName: 'DollarSign', ...NEUTRAL },
  operational_productivity: { iconName: 'Activity', ...NEUTRAL },
  scalability_resilience: { iconName: 'Layers', ...NEUTRAL },
  customer_experience: { iconName: 'Heart', ...NEUTRAL },
  risk_mitigation: { iconName: 'Shield', ...NEUTRAL },
  regulatory_compliance: { iconName: 'FileCheck', ...NEUTRAL },
  time_to_outcome: { iconName: 'Zap', ...NEUTRAL },
  integration_interoperability: { iconName: 'Link', ...NEUTRAL },
  data_driven_insight: { iconName: 'BarChart3', ...NEUTRAL },
  innovation_agility: { iconName: 'Lightbulb', ...NEUTRAL },
  brand_differentiation: { iconName: 'Award', ...NEUTRAL },
  sustainability_esg: { iconName: 'Leaf', ...NEUTRAL },
  talent_retention: { iconName: 'Users', ...NEUTRAL },
  vendor_partnership: { iconName: 'Handshake', ...NEUTRAL }
};

// Get display config for a primitive
export const getPrimitiveDisplayConfig = (id: ValuePrimitiveId): PrimitiveDisplayConfig => {
  return PRIMITIVE_DISPLAY_CONFIG[id];
};

// Category colors for grouping primitives (neutral, like the primitives)
const CATEGORY_NEUTRAL = { colorClass: NEUTRAL.colorClass, bgClass: NEUTRAL.bgClass, borderClass: NEUTRAL.borderClass };

export const CATEGORY_COLORS = {
  financial: { label: 'Financial', ...CATEGORY_NEUTRAL },
  operational: { label: 'Operational', ...CATEGORY_NEUTRAL },
  strategic: { label: 'Strategic', ...CATEGORY_NEUTRAL },
  compliance: { label: 'Compliance', ...CATEGORY_NEUTRAL }
};
