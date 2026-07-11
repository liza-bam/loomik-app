// Role-to-Primitive Default Mappings
// Based on PO's BRD role defaults table

import type { ValuePrimitiveId, StakeholderPrimitiveWeight } from './types';

export interface RolePrimitiveMapping {
  primary: ValuePrimitiveId[];
  secondary: ValuePrimitiveId[];
}

// Role-based default primitive mappings from PO's document
export const ROLE_PRIMITIVE_DEFAULTS: Record<string, RolePrimitiveMapping> = {
  // C-Suite
  'CEO': {
    primary: ['brand_differentiation', 'revenue_growth'],
    secondary: ['risk_mitigation', 'innovation_agility']
  },
  'CFO': {
    primary: ['revenue_growth', 'cost_efficiency', 'risk_mitigation'],
    secondary: ['regulatory_compliance', 'time_to_outcome']
  },
  'CTO': {
    primary: ['scalability_resilience', 'integration_interoperability', 'innovation_agility'],
    secondary: ['data_driven_insight', 'time_to_outcome']
  },
  'CIO': {
    primary: ['scalability_resilience', 'integration_interoperability'],
    secondary: ['data_driven_insight', 'risk_mitigation']
  },
  'COO': {
    primary: ['operational_productivity', 'time_to_outcome'],
    secondary: ['cost_efficiency', 'scalability_resilience']
  },
  'CMO': {
    primary: ['revenue_growth', 'customer_experience', 'brand_differentiation'],
    secondary: ['data_driven_insight', 'innovation_agility']
  },
  'CISO': {
    primary: ['risk_mitigation', 'regulatory_compliance'],
    secondary: ['data_driven_insight', 'integration_interoperability']
  },
  'CHRO': {
    primary: ['talent_retention', 'operational_productivity'],
    secondary: ['customer_experience', 'brand_differentiation']
  },
  
  // VP Level
  'VP Operations': {
    primary: ['operational_productivity', 'cost_efficiency'],
    secondary: ['time_to_outcome', 'scalability_resilience']
  },
  'VP Sales': {
    primary: ['revenue_growth', 'customer_experience'],
    secondary: ['time_to_outcome', 'data_driven_insight']
  },
  'VP Product': {
    primary: ['innovation_agility', 'customer_experience'],
    secondary: ['time_to_outcome', 'data_driven_insight']
  },
  'VP Engineering': {
    primary: ['scalability_resilience', 'integration_interoperability'],
    secondary: ['innovation_agility', 'operational_productivity']
  },
  'VP Marketing': {
    primary: ['brand_differentiation', 'customer_experience'],
    secondary: ['data_driven_insight', 'revenue_growth']
  },
  'VP Finance': {
    primary: ['cost_efficiency', 'risk_mitigation'],
    secondary: ['regulatory_compliance', 'data_driven_insight']
  },
  'VP IT': {
    primary: ['integration_interoperability', 'scalability_resilience'],
    secondary: ['risk_mitigation', 'operational_productivity']
  },
  'VP Infrastructure': {
    primary: ['scalability_resilience', 'risk_mitigation'],
    secondary: ['cost_efficiency', 'integration_interoperability']
  },
  
  // Director/Manager Level
  'Director': {
    primary: ['operational_productivity', 'time_to_outcome'],
    secondary: ['cost_efficiency', 'customer_experience']
  },
  'IT Director': {
    primary: ['integration_interoperability', 'scalability_resilience'],
    secondary: ['risk_mitigation', 'time_to_outcome']
  },
  'Marketing Director': {
    primary: ['brand_differentiation', 'customer_experience'],
    secondary: ['data_driven_insight', 'revenue_growth']
  },
  'Design Director': {
    primary: ['customer_experience', 'innovation_agility'],
    secondary: ['brand_differentiation', 'time_to_outcome']
  },
  'Product Manager': {
    primary: ['customer_experience', 'innovation_agility'],
    secondary: ['time_to_outcome', 'data_driven_insight']
  },
  
  // Specialized Roles
  'Legal': {
    primary: ['regulatory_compliance', 'risk_mitigation'],
    secondary: ['vendor_partnership', 'cost_efficiency']
  },
  'Legal Counsel': {
    primary: ['regulatory_compliance', 'risk_mitigation'],
    secondary: ['vendor_partnership', 'cost_efficiency']
  },
  'Procurement': {
    primary: ['cost_efficiency', 'vendor_partnership'],
    secondary: ['risk_mitigation', 'time_to_outcome']
  },
  'Procurement Lead': {
    primary: ['cost_efficiency', 'vendor_partnership'],
    secondary: ['risk_mitigation', 'time_to_outcome']
  },
  'Procurement Manager': {
    primary: ['cost_efficiency', 'vendor_partnership'],
    secondary: ['time_to_outcome', 'regulatory_compliance']
  },
  'Finance Director': {
    primary: ['cost_efficiency', 'revenue_growth'],
    secondary: ['risk_mitigation', 'regulatory_compliance']
  },
  'DPO': {
    primary: ['regulatory_compliance', 'risk_mitigation'],
    secondary: ['data_driven_insight', 'integration_interoperability']
  },
  'Head of Security': {
    primary: ['risk_mitigation', 'regulatory_compliance'],
    secondary: ['integration_interoperability', 'data_driven_insight']
  },
  'Head of E-commerce': {
    primary: ['revenue_growth', 'customer_experience'],
    secondary: ['scalability_resilience', 'integration_interoperability']
  }
};

// Normalize role string to match our mapping (handles variations)
const normalizeRole = (role: string): string => {
  const normalized = role.trim();
  
  // Direct match first
  if (ROLE_PRIMITIVE_DEFAULTS[normalized]) {
    return normalized;
  }
  
  // Try case-insensitive match
  const lowerRole = normalized.toLowerCase();
  for (const key of Object.keys(ROLE_PRIMITIVE_DEFAULTS)) {
    if (key.toLowerCase() === lowerRole) {
      return key;
    }
  }
  
  // Try partial matches for common patterns
  if (lowerRole.includes('cfo') || lowerRole.includes('chief financial')) return 'CFO';
  if (lowerRole.includes('cto') || lowerRole.includes('chief technology')) return 'CTO';
  if (lowerRole.includes('cio') || lowerRole.includes('chief information')) return 'CIO';
  if (lowerRole.includes('coo') || lowerRole.includes('chief operating')) return 'COO';
  if (lowerRole.includes('cmo') || lowerRole.includes('chief marketing')) return 'CMO';
  if (lowerRole.includes('ceo') || lowerRole.includes('chief executive')) return 'CEO';
  if (lowerRole.includes('ciso') || lowerRole.includes('chief security')) return 'CISO';
  if (lowerRole.includes('vp operations') || lowerRole.includes('vp ops')) return 'VP Operations';
  if (lowerRole.includes('vp sales')) return 'VP Sales';
  if (lowerRole.includes('vp product')) return 'VP Product';
  if (lowerRole.includes('vp engineering')) return 'VP Engineering';
  if (lowerRole.includes('vp marketing')) return 'VP Marketing';
  if (lowerRole.includes('vp finance')) return 'VP Finance';
  if (lowerRole.includes('vp it') || lowerRole.includes('vp infrastructure')) return 'VP IT';
  if (lowerRole.includes('legal')) return 'Legal';
  if (lowerRole.includes('procurement')) return 'Procurement';
  if (lowerRole.includes('dpo') || lowerRole.includes('data protection')) return 'DPO';
  if (lowerRole.includes('director')) return 'Director';
  
  // Default fallback
  return 'Director';
};

// Get primitive weights for a given role
export const getPrimitivesForRole = (role: string): StakeholderPrimitiveWeight[] => {
  const normalizedRole = normalizeRole(role);
  const mapping = ROLE_PRIMITIVE_DEFAULTS[normalizedRole] || ROLE_PRIMITIVE_DEFAULTS['Director'];
  
  const weights: StakeholderPrimitiveWeight[] = [];
  
  // Primary primitives get weight 80-90
  mapping.primary.forEach((primitiveId, index) => {
    weights.push({
      primitiveId,
      weight: 90 - (index * 5), // 90, 85, 80 for first 3
      isPrimary: true
    });
  });
  
  // Secondary primitives get weight 50-60
  mapping.secondary.forEach((primitiveId, index) => {
    weights.push({
      primitiveId,
      weight: 60 - (index * 5), // 60, 55, 50 for first 3
      isPrimary: false
    });
  });
  
  return weights;
};

// Get top N primitives for a role (for display in cards)
export const getTopPrimitivesForRole = (role: string, count: number = 3): ValuePrimitiveId[] => {
  const primitives = getPrimitivesForRole(role);
  return primitives
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count)
    .map(p => p.primitiveId);
};

// Check if a primitive is primary for a given role
export const isPrimitivePrimaryForRole = (role: string, primitiveId: ValuePrimitiveId): boolean => {
  const normalizedRole = normalizeRole(role);
  const mapping = ROLE_PRIMITIVE_DEFAULTS[normalizedRole] || ROLE_PRIMITIVE_DEFAULTS['Director'];
  return mapping.primary.includes(primitiveId);
};
