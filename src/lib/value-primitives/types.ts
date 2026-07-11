// 15 Universal Value Primitives - Based on PO's BRD
// Each primitive represents a fundamental buyer value driver

export type ValuePrimitiveId =
  | 'revenue_growth'
  | 'cost_efficiency'
  | 'operational_productivity'
  | 'scalability_resilience'
  | 'customer_experience'
  | 'risk_mitigation'
  | 'regulatory_compliance'
  | 'time_to_outcome'
  | 'integration_interoperability'
  | 'data_driven_insight'
  | 'innovation_agility'
  | 'brand_differentiation'
  | 'sustainability_esg'
  | 'talent_retention'
  | 'vendor_partnership';

export interface ValuePrimitive {
  id: ValuePrimitiveId;
  label: string;
  shortLabel: string;
  description: string;
  icon: string; // Lucide icon name
  kpis: string[];
  semanticRoots: string[]; // Keywords for AI detection
  category: 'financial' | 'operational' | 'strategic' | 'compliance';
}

export interface StakeholderPrimitiveWeight {
  primitiveId: ValuePrimitiveId;
  weight: number; // 0-100, buyer's priority
  isPrimary: boolean;
}

export interface SellerPrimitiveStrength {
  primitiveId: ValuePrimitiveId;
  strength: number; // 0-3 scale (0=None, 1=Low, 2=Med, 3=High)
  normalizedStrength: number; // 0-100 for comparison with buyer weights
  deploymentMode?: 'cloud' | 'on-prem' | 'hybrid';
  icpSegments?: string[];
  caseStudyIds?: string[];
}

export interface PrimitiveGap {
  primitiveId: ValuePrimitiveId;
  buyerWeight: number;
  sellerStrength: number;
  gapScore: number; // |buyerWeight - sellerStrength|
  gapType: 'aligned' | 'partial' | 'gap';
  translationLoss: number; // Weighted contribution to overall Translation Loss
}

export interface AlignmentResult {
  overallAlignment: number; // 0-100
  translationLoss: number; // 0-100 (inverse of alignment)
  primitiveGaps: PrimitiveGap[];
  topGaps: PrimitiveGap[]; // Top 3 gaps sorted by impact
  topAligned: PrimitiveGap[]; // Top 3 aligned primitives
}

// All 15 Value Primitives with metadata
export const VALUE_PRIMITIVES: ValuePrimitive[] = [
  {
    id: 'revenue_growth',
    label: 'Revenue Growth',
    shortLabel: 'Revenue',
    description: 'Drive top-line growth through new revenue streams, market expansion, or improved win rates',
    icon: 'TrendingUp',
    kpis: ['Revenue increase %', 'Win rate', 'Market share'],
    semanticRoots: ['revenue', 'growth', 'sales', 'pipeline', 'win rate', 'market share'],
    category: 'financial'
  },
  {
    id: 'cost_efficiency',
    label: 'Cost Efficiency',
    shortLabel: 'Cost',
    description: 'Reduce operational costs, improve margins, and optimize resource utilization',
    icon: 'DollarSign',
    kpis: ['OPEX %', 'Cost per unit', 'TCO reduction'],
    semanticRoots: ['cost', 'savings', 'efficiency', 'margin', 'budget', 'ROI', 'TCO'],
    category: 'financial'
  },
  {
    id: 'operational_productivity',
    label: 'Operational Productivity',
    shortLabel: 'Productivity',
    description: 'Increase output and efficiency of operations, reduce manual effort',
    icon: 'Activity',
    kpis: ['Throughput', 'Automation rate', 'FTE savings'],
    semanticRoots: ['productivity', 'automation', 'efficiency', 'workflow', 'process'],
    category: 'operational'
  },
  {
    id: 'scalability_resilience',
    label: 'Scalability & Resilience',
    shortLabel: 'Scalability',
    description: 'Build systems that scale with growth and withstand disruptions',
    icon: 'Layers',
    kpis: ['Uptime %', 'Scale capacity', 'Recovery time'],
    semanticRoots: ['scale', 'resilience', 'uptime', 'availability', 'disaster recovery'],
    category: 'operational'
  },
  {
    id: 'customer_experience',
    label: 'Customer Experience',
    shortLabel: 'CX',
    description: 'Improve customer satisfaction, retention, and lifetime value',
    icon: 'Heart',
    kpis: ['NPS', 'CSAT', 'Customer retention'],
    semanticRoots: ['customer', 'experience', 'satisfaction', 'NPS', 'retention', 'loyalty'],
    category: 'strategic'
  },
  {
    id: 'risk_mitigation',
    label: 'Risk Mitigation',
    shortLabel: 'Risk',
    description: 'Reduce business, security, and operational risks',
    icon: 'Shield',
    kpis: ['Incident reduction', 'Risk score', 'Audit findings'],
    semanticRoots: ['risk', 'security', 'threat', 'vulnerability', 'protection'],
    category: 'compliance'
  },
  {
    id: 'regulatory_compliance',
    label: 'Regulatory Compliance',
    shortLabel: 'Compliance',
    description: 'Meet regulatory requirements and industry standards',
    icon: 'FileCheck',
    kpis: ['Compliance score', 'Audit pass rate', 'Penalty avoidance'],
    semanticRoots: ['compliance', 'regulation', 'audit', 'GDPR', 'SOC', 'HIPAA', 'legal'],
    category: 'compliance'
  },
  {
    id: 'time_to_outcome',
    label: 'Time to Outcome',
    shortLabel: 'Speed',
    description: 'Accelerate time to value, faster implementation and ROI realization',
    icon: 'Zap',
    kpis: ['Implementation time', 'Time to value', 'Cycle time'],
    semanticRoots: ['speed', 'time', 'fast', 'quick', 'accelerate', 'implementation'],
    category: 'operational'
  },
  {
    id: 'integration_interoperability',
    label: 'Integration & Interoperability',
    shortLabel: 'Integration',
    description: 'Seamless connectivity with existing systems and data flows',
    icon: 'Link',
    kpis: ['API coverage', 'Integration count', 'Data sync latency'],
    semanticRoots: ['integration', 'API', 'connectivity', 'interoperability', 'ecosystem'],
    category: 'operational'
  },
  {
    id: 'data_driven_insight',
    label: 'Data-Driven Insight',
    shortLabel: 'Data',
    description: 'Enable better decisions through analytics, AI, and visibility',
    icon: 'BarChart3',
    kpis: ['Dashboard adoption', 'Decision accuracy', 'Forecast precision'],
    semanticRoots: ['data', 'analytics', 'insight', 'AI', 'intelligence', 'visibility'],
    category: 'strategic'
  },
  {
    id: 'innovation_agility',
    label: 'Innovation & Agility',
    shortLabel: 'Innovation',
    description: 'Enable rapid experimentation, adaptation, and competitive advantage',
    icon: 'Lightbulb',
    kpis: ['Feature velocity', 'Experiment rate', 'Time to market'],
    semanticRoots: ['innovation', 'agility', 'experiment', 'competitive', 'differentiation'],
    category: 'strategic'
  },
  {
    id: 'brand_differentiation',
    label: 'Brand Differentiation',
    shortLabel: 'Brand',
    description: 'Strengthen brand positioning and market perception',
    icon: 'Award',
    kpis: ['Brand awareness', 'Market position', 'Share of voice'],
    semanticRoots: ['brand', 'reputation', 'positioning', 'perception', 'thought leadership'],
    category: 'strategic'
  },
  {
    id: 'sustainability_esg',
    label: 'Sustainability & ESG',
    shortLabel: 'ESG',
    description: 'Meet environmental, social, and governance commitments',
    icon: 'Leaf',
    kpis: ['Carbon footprint', 'ESG score', 'Sustainability metrics'],
    semanticRoots: ['sustainability', 'ESG', 'green', 'carbon', 'environmental', 'social'],
    category: 'compliance'
  },
  {
    id: 'talent_retention',
    label: 'Talent Retention',
    shortLabel: 'Talent',
    description: 'Attract, retain, and develop top talent',
    icon: 'Users',
    kpis: ['Retention rate', 'Employee satisfaction', 'Training completion'],
    semanticRoots: ['talent', 'retention', 'employee', 'workforce', 'HR', 'hiring'],
    category: 'strategic'
  },
  {
    id: 'vendor_partnership',
    label: 'Vendor Partnership',
    shortLabel: 'Partnership',
    description: 'Strategic vendor relationships and ecosystem benefits',
    icon: 'Handshake',
    kpis: ['Partner satisfaction', 'SLA compliance', 'Strategic alignment'],
    semanticRoots: ['vendor', 'partner', 'relationship', 'strategic', 'ecosystem'],
    category: 'strategic'
  }
];

// Helper function to get primitive by ID
export const getPrimitiveById = (id: ValuePrimitiveId): ValuePrimitive | undefined => {
  return VALUE_PRIMITIVES.find(p => p.id === id);
};

// Helper function to get primitives by category
export const getPrimitivesByCategory = (category: ValuePrimitive['category']): ValuePrimitive[] => {
  return VALUE_PRIMITIVES.filter(p => p.category === category);
};
