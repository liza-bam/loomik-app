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

// Display configuration for each primitive
export const PRIMITIVE_DISPLAY_CONFIG: Record<ValuePrimitiveId, PrimitiveDisplayConfig> = {
  revenue_growth: {
    iconName: 'TrendingUp',
    colorClass: 'text-green',
    bgClass: 'bg-green/10',
    borderClass: 'border-green/30',
    gradientFrom: 'from-green/20',
    gradientTo: 'to-green/5'
  },
  cost_efficiency: {
    iconName: 'DollarSign',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-emerald-500/5'
  },
  operational_productivity: {
    iconName: 'Activity',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-blue-500/5'
  },
  scalability_resilience: {
    iconName: 'Layers',
    colorClass: 'text-purple',
    bgClass: 'bg-purple/10',
    borderClass: 'border-purple/30',
    gradientFrom: 'from-purple/20',
    gradientTo: 'to-purple/5'
  },
  customer_experience: {
    iconName: 'Heart',
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/30',
    gradientFrom: 'from-pink-500/20',
    gradientTo: 'to-pink-500/5'
  },
  risk_mitigation: {
    iconName: 'Shield',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    gradientFrom: 'from-orange-500/20',
    gradientTo: 'to-orange-500/5'
  },
  regulatory_compliance: {
    iconName: 'FileCheck',
    colorClass: 'text-slate-600',
    bgClass: 'bg-slate-600/10',
    borderClass: 'border-slate-600/30',
    gradientFrom: 'from-slate-600/20',
    gradientTo: 'to-slate-600/5'
  },
  time_to_outcome: {
    iconName: 'Zap',
    colorClass: 'text-yellow',
    bgClass: 'bg-yellow/10',
    borderClass: 'border-yellow/30',
    gradientFrom: 'from-yellow/20',
    gradientTo: 'to-yellow/5'
  },
  integration_interoperability: {
    iconName: 'Link',
    colorClass: 'text-cyan-500',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    gradientFrom: 'from-cyan-500/20',
    gradientTo: 'to-cyan-500/5'
  },
  data_driven_insight: {
    iconName: 'BarChart3',
    colorClass: 'text-indigo-500',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/30',
    gradientFrom: 'from-indigo-500/20',
    gradientTo: 'to-indigo-500/5'
  },
  innovation_agility: {
    iconName: 'Lightbulb',
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-amber-500/5'
  },
  brand_differentiation: {
    iconName: 'Award',
    colorClass: 'text-violet-500',
    bgClass: 'bg-violet-500/10',
    borderClass: 'border-violet-500/30',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-violet-500/5'
  },
  sustainability_esg: {
    iconName: 'Leaf',
    colorClass: 'text-teal-500',
    bgClass: 'bg-teal-500/10',
    borderClass: 'border-teal-500/30',
    gradientFrom: 'from-teal-500/20',
    gradientTo: 'to-teal-500/5'
  },
  talent_retention: {
    iconName: 'Users',
    colorClass: 'text-rose-500',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
    gradientFrom: 'from-rose-500/20',
    gradientTo: 'to-rose-500/5'
  },
  vendor_partnership: {
    iconName: 'Handshake',
    colorClass: 'text-sky-500',
    bgClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/30',
    gradientFrom: 'from-sky-500/20',
    gradientTo: 'to-sky-500/5'
  }
};

// Get display config for a primitive
export const getPrimitiveDisplayConfig = (id: ValuePrimitiveId): PrimitiveDisplayConfig => {
  return PRIMITIVE_DISPLAY_CONFIG[id];
};

// Category colors for grouping primitives
export const CATEGORY_COLORS = {
  financial: {
    label: 'Financial',
    colorClass: 'text-green',
    bgClass: 'bg-green/10',
    borderClass: 'border-green/30'
  },
  operational: {
    label: 'Operational',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30'
  },
  strategic: {
    label: 'Strategic',
    colorClass: 'text-purple',
    bgClass: 'bg-purple/10',
    borderClass: 'border-purple/30'
  },
  compliance: {
    label: 'Compliance',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30'
  }
};
