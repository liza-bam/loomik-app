// Win Path Section - Shows deal stages with tabs
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Search, BadgeCheck, Users, Flag, LucideIcon, Pencil, Check, X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Deal, Stakeholder } from "@/data/dealData";

interface WinPathSectionProps {
  deal: Deal;
  stakeholders: Stakeholder[];
  winProbability: number;
  alignmentScore: number;
}

type StageKey = 'diagnose' | 'validate' | 'align' | 'commit';

interface StageItem {
  id: string;
  name: string;
  description: string;
  value: string;
  source: string;
  status: 'complete' | 'pending';
}

interface StageData {
  key: StageKey;
  name: string;
  description: string;
  progress: number;
  status: 'in_progress' | 'pending' | 'complete';
  hasAlert: boolean;
  icon: LucideIcon;
  items: StageItem[];
}

const getProgressTextColor = (progress: number, status: string) => {
  if (status === 'pending' || progress < 40) return 'text-red';
  if (progress < 70) return 'text-orange';
  return 'text-green';
};

export const WinPathSection = ({ deal, stakeholders, winProbability, alignmentScore }: WinPathSectionProps) => {
  const [activeStage, setActiveStage] = useState<StageKey>(deal.stage as StageKey);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'description' | 'source' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Edits storage (in real app, this would persist to database)
  const [edits, setEdits] = useState<Record<string, Partial<StageItem>>>({});

  // Generate stage data based on deal information
  const engagedCount = stakeholders.filter(s => s.engagementCategory === 'engaged').length;
  const totalStakeholders = stakeholders.length;

  const stages: StageData[] = [
    {
      key: 'diagnose',
      name: 'Diagnose',
      description: 'Clarify buyer pain and emotional urgency',
      progress: 70,
      status: 'in_progress',
      icon: Search,
      hasAlert: false,
      items: [
        {
          id: 'diagnose-1',
          name: 'Problem Statement',
          description: 'Fragmented underwriting workflow increases cycle time by 35% and error rates for mid-market deals, causing revenue leakage and compliance gaps.',
          value: '',
          source: 'BVM',
          status: 'complete',
        },
        {
          id: 'diagnose-2',
          name: 'Pain Level',
          description: 'High',
          value: '',
          source: 'Sentiment Engine',
          status: 'pending',
        },
        {
          id: 'diagnose-3',
          name: 'Business Impact',
          description: '$1.2M annual impact from delayed deals and manual rework cycles',
          value: '',
          source: 'BVM',
          status: 'complete',
        },
        {
          id: 'diagnose-4',
          name: 'Executive Goal Alignment',
          description: 'Reduce underwriting cycle time by 20% • Improve compliance audit readiness to 98%',
          value: '',
          source: 'BVM',
          status: 'pending',
        },
        {
          id: 'diagnose-5',
          name: 'Fit Score',
          description: `${Math.round(alignmentScore * 0.88)}%`,
          value: '',
          source: 'Alignment Engine',
          status: 'pending',
        },
      ],
    },
    {
      key: 'validate',
      name: 'Validate',
      description: 'Show how the solution creates value and provides proof',
      progress: 66,
      status: 'in_progress',
      icon: BadgeCheck,
      hasAlert: false,
      items: [
        {
          id: 'validate-1',
          name: 'Solution Proposed',
          description: 'Automation Module v2 – streamlines onboarding workflows',
          value: '',
          source: 'SVM',
          status: 'complete',
        },
        {
          id: 'validate-2',
          name: 'Value Creation',
          description: 'Reduces manual data entry → 40% faster Time-to-Outcome',
          value: '',
          source: 'Alignment Engine / BVM',
          status: 'pending',
        },
        {
          id: 'validate-3',
          name: 'Proof Assets Shared',
          description: '5 assets linked (ROI calculator, case study: TechCorp, proof of concept demo)',
          value: '',
          source: 'SVM',
          status: 'complete',
        },
        {
          id: 'validate-4',
          name: 'Proof Strength',
          description: '55% relevance score',
          value: '',
          source: 'SVM / Alignment',
          status: 'complete',
        },
        {
          id: 'validate-5',
          name: 'ROI / COI',
          description: 'ROI = 5.6-month payback | COI = $142,000 loss per quarter',
          value: '',
          source: 'BVM / SVM / ROI',
          status: 'pending',
        },
        {
          id: 'validate-6',
          name: 'Sentiment Trend',
          description: 'Improving',
          value: '',
          source: 'Sentiment Engine',
          status: 'pending',
        },
      ],
    },
    {
      key: 'align',
      name: 'Align',
      description: 'Visualize agreement and gaps across stakeholders',
      progress: 67,
      status: 'in_progress',
      icon: Users,
      hasAlert: false,
      items: [
        {
          id: 'align-1',
          name: 'Consensus Score',
          description: `${alignmentScore}% alignment achieved`,
          value: '',
          source: 'Consensus Engine',
          status: 'complete',
        },
        {
          id: 'align-2',
          name: 'Stakeholders Engaged',
          description: `${engagedCount} of ${totalStakeholders} actively engaged in discussions`,
          value: '',
          source: 'BVM',
          status: 'complete',
        },
        {
          id: 'align-3',
          name: 'Top Variance Driver',
          description: 'Security risk concerns about data residency and encryption standards',
          value: '',
          source: 'Consensus Engine',
          status: 'pending',
        },
        {
          id: 'align-4',
          name: 'Unacknowledged Execs',
          description: 'CISO has not yet reviewed security requirements',
          value: '',
          source: 'BVM',
          status: 'pending',
        },
      ],
    },
    {
      key: 'commit',
      name: 'Commit',
      description: 'Show close readiness and approval status',
      progress: 33,
      status: 'pending',
      icon: Flag,
      hasAlert: true,
      items: [
        {
          id: 'commit-1',
          name: 'Department Status',
          description: 'Finance ✓ | Security ✗ | Legal ✓ | Procurement ✗',
          value: '',
          source: 'BVM / CRM',
          status: 'pending',
        },
        {
          id: 'commit-2',
          name: 'Next Step Needed',
          description: 'Book Security Architecture review with CISO team by next week',
          value: '',
          source: 'Drift Detector / SAGE',
          status: 'pending',
        },
        {
          id: 'commit-3',
          name: 'Days Since Last Activity',
          description: 'Last activity 3 days ago (Stakeholder interview with CFO)',
          value: '',
          source: 'CRM',
          status: 'pending',
        },
        {
          id: 'commit-4',
          name: 'Risk Note',
          description: 'Security sentiment declining slightly - needs executive sponsorship',
          value: '',
          source: 'Drift Detector',
          status: 'pending',
        },
      ],
    },
  ];

  const activeStageData = stages.find(s => s.key === activeStage)!;
  
  // Apply edits to items
  const getItemValue = (item: StageItem, field: 'name' | 'description' | 'source') => {
    return edits[item.id]?.[field] ?? item[field];
  };

  const startEditing = (id: string, field: 'name' | 'description' | 'source', value: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = () => {
    if (editingId && editingField) {
      setEdits(prev => ({
        ...prev,
        [editingId]: {
          ...prev[editingId],
          [editingField]: editValue,
        },
      }));
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditValue('');
  };

  // Editable field component
  const EditableField = ({ 
    id, 
    field, 
    value, 
    isMultiline = false,
    className 
  }: { 
    id: string; 
    field: 'name' | 'description' | 'source'; 
    value: string; 
    isMultiline?: boolean;
    className?: string;
  }) => {
    const isEditing = editingId === id && editingField === field;
    
    if (isEditing) {
      return (
        <div className="space-y-1.5">
          {isMultiline ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-sm min-h-[60px] resize-none"
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="text-sm h-8"
              autoFocus
            />
          )}
          <div className="flex gap-1">
            <Button size="sm" variant="default" className="h-6 text-xs gap-1 px-2" onClick={saveEdit}>
              <Check className="w-3 h-3" /> Save
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={cancelEdit}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <div className={cn("group/edit relative", className)}>
        <p className={cn(
          "pr-6",
          field === 'name' ? "font-medium text-foreground" : "text-muted-foreground",
          field === 'source' && "text-xs"
        )}>
          {value}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            startEditing(id, field, value);
          }}
          className="absolute top-0 right-0 p-1 opacity-0 group-hover/edit:opacity-100 hover:bg-muted rounded transition-opacity"
          title="Edit"
        >
          <Pencil className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Stage Pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {stages.map((stage) => {
          const isActive = activeStage === stage.key;
          const StageIcon = stage.icon;
          
          return (
            <button
              key={stage.key}
              onClick={() => setActiveStage(stage.key)}
              className={cn(
                "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-purple text-white shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              {stage.hasAlert ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <StageIcon className="w-3 h-3" />
              )}
              <span>{stage.name}</span>
              <span className={cn(
                "font-semibold",
                isActive ? "text-white/90" : getProgressTextColor(stage.progress, stage.status)
              )}>
                {stage.progress}%
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Summary Box - matches Win Probability style */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple" />
          Summary
        </h3>
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="space-y-3">
            <p className="text-base text-foreground leading-relaxed">{activeStageData.description}</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    activeStageData.progress < 40 ? "bg-red" : activeStageData.progress < 70 ? "bg-orange" : "bg-green"
                  )}
                  style={{ width: `${activeStageData.progress}%` }}
                />
              </div>
              <span className={cn("text-sm font-semibold", getProgressTextColor(activeStageData.progress, activeStageData.status))}>
                {activeStageData.progress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Panel - Table only */}
      <Card className="overflow-hidden">
        {/* Items Table */}
        <div className="divide-y divide-border">
          <div className="grid grid-cols-[1fr_2fr_1fr_80px] gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
            <span>Item</span>
            <span>Description</span>
            <span>Source</span>
            <span className="text-center">Status</span>
          </div>
          {activeStageData.items.map((item) => (
            <div 
              key={item.id}
              className="grid grid-cols-[1fr_2fr_1fr_80px] gap-4 px-4 py-2.5 text-sm hover:bg-muted/30 transition-colors"
            >
              <EditableField 
                id={item.id} 
                field="name" 
                value={getItemValue(item, 'name')} 
              />
              <EditableField 
                id={item.id} 
                field="description" 
                value={getItemValue(item, 'description')} 
                isMultiline
              />
              <EditableField 
                id={item.id} 
                field="source" 
                value={getItemValue(item, 'source')} 
              />
              <div className="flex justify-center">
                {item.status === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-green" />
                ) : (
                  <span className="text-xs text-muted-foreground">Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WinPathSection;
