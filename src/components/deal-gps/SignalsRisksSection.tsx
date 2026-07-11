// SignalsRisksSection - Side by side Signals & Risks for Deal GPS
import { useState, useMemo } from "react";
import { AlertTriangle, Zap, ChevronDown, ChevronUp, ArrowRight, Clock, Database, Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useSignalsStore, DetectedSignal } from "@/stores/signalsStore";
import { useSignalProcessor } from "@/hooks/useSignalProcessor";
import { toast } from "@/hooks/use-toast";
import { CRITICAL_EVENT_LABELS } from "@/data/signalsData";

interface SignalsRisksSectionProps {
  dealId: number;
  dealName: string;
  isOpen: boolean;
  onToggle: () => void;
}

// Helper to format time ago
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const ITEMS_PER_PAGE = 5;

export const SignalsRisksSection = ({ dealId, dealName, isOpen, onToggle }: SignalsRisksSectionProps) => {
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'trigger' | 'evidence' | 'suggestedAction' | null>(null);
  const [editValue, setEditValue] = useState("");
  const [risksPage, setRisksPage] = useState(1);
  const [signalsPage, setSignalsPage] = useState(1);

  const { 
    signals: allStoreSignals,
    getSignalsByDeal, 
    ignoreSignal, 
    unignoreSignal, 
    updateSignal,
    ignoreAllSignals 
  } = useSignalsStore();
  
  const { processSignalWithActions, processAllWithActions } = useSignalProcessor();

  // Filter signals and risks for this deal - check both dealId AND dealName for robustness
  const dealSignals = useMemo(() => {
    // First try by dealId
    let signals = getSignalsByDeal(dealId);
    
    // If no results, also try by dealName as fallback
    if (signals.length === 0 && dealName) {
      signals = allStoreSignals.filter(s => s.dealName === dealName);
    }
    
    return signals.filter(s => s.status === 'pending');
  }, [getSignalsByDeal, dealId, dealName, allStoreSignals]);

  const risks = useMemo(() => 
    dealSignals.filter(s => s.type === 'risk').sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }), 
  [dealSignals]);

  const signals = useMemo(() => 
    dealSignals.filter(s => s.type === 'signal').sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    }), 
  [dealSignals]);

  // Pagination
  const paginatedRisks = useMemo(() => 
    risks.slice(0, risksPage * ITEMS_PER_PAGE), 
  [risks, risksPage]);
  
  const paginatedSignals = useMemo(() => 
    signals.slice(0, signalsPage * ITEMS_PER_PAGE), 
  [signals, signalsPage]);

  const hasMoreRisks = risks.length > risksPage * ITEMS_PER_PAGE;
  const hasMoreSignals = signals.length > signalsPage * ITEMS_PER_PAGE;

  const handleProcess = (signal: DetectedSignal) => {
    processSignalWithActions(signal);
    toast({
      title: signal.type === 'risk' ? "Risk addressed" : "Signal processed",
      description: "Actions have been generated in the Action Hub.",
    });
  };

  const handleProcessAll = (type: 'risk' | 'signal') => {
    const items = type === 'risk' ? risks : signals;
    if (items.length === 0) return;
    
    processAllWithActions(type);
    toast({
      title: `All ${type === 'risk' ? 'risks' : 'signals'} processed`,
      description: `${items.length} ${type === 'risk' ? 'risk' : 'signal'}${items.length > 1 ? 's' : ''} addressed. Actions generated.`,
    });
  };

  const handleIgnoreAll = (type: 'risk' | 'signal') => {
    ignoreAllSignals(type);
    toast({
      title: `All ${type === 'risk' ? 'risks' : 'signals'} ignored`,
      description: "Items moved to history.",
    });
  };

  const handleIgnore = (signal: DetectedSignal) => {
    ignoreSignal(signal.id);
    const { dismiss } = toast({
      title: `${signal.type === 'risk' ? 'Risk' : 'Signal'} ignored`,
      description: signal.name,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            unignoreSignal(signal.id);
            dismiss();
          }}
          className="h-7 text-xs"
        >
          Undo
        </Button>
      ),
      duration: 5000,
    });
  };

  const startEditing = (id: string, field: 'trigger' | 'evidence' | 'suggestedAction', currentValue: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const saveEdit = () => {
    if (editingId && editingField) {
      updateSignal(editingId, { [editingField]: editValue });
      toast({ title: "Updated", description: "Changes saved." });
    }
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditValue("");
  };

  const getStakeholderInfo = (signal: DetectedSignal) => {
    if (signal.stakeholder) {
      return {
        name: signal.stakeholder.name,
        role: signal.stakeholder.role,
        avatar: signal.stakeholder.avatar,
        initials: signal.stakeholder.name.split(' ').map(n => n[0]).join('')
      };
    }
    return { name: 'Unknown', role: 'Contact', avatar: undefined, initials: 'UN' };
  };

  // Signal/Risk Card Component
  const SignalCard = ({ item, isRisk, isExpanded, onToggle }: { 
    item: DetectedSignal; 
    isRisk: boolean;
    isExpanded: boolean;
    onToggle: () => void;
  }) => {
    const stakeholder = getStakeholderInfo(item);
    const isCritical = item.severity === 'critical';
    const isEditingThis = editingId === item.id;

    return (
      <div 
        className={cn(
          "border rounded-lg bg-card transition-shadow",
          isCritical && isRisk && "border-red/40 bg-red/5",
          isCritical && !isRisk && "border-green/40 bg-green/5",
          !isCritical && "hover:shadow-sm"
        )}
      >
        <button
          className="w-full p-3 flex items-start gap-3 text-left"
          onClick={onToggle}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarImage src={stakeholder.avatar} />
              <AvatarFallback className="text-xs">{stakeholder.initials}</AvatarFallback>
            </Avatar>
            {isCritical && (
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center",
                isRisk ? "bg-red" : "bg-green"
              )}>
                <Zap className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isCritical && (
                <Badge variant="outline" className={cn(
                  "text-xxs px-1.5 py-0 h-4 font-semibold animate-pulse",
                  isRisk ? "border-red text-red" : "border-green text-green"
                )}>
                  CRITICAL
                </Badge>
              )}
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xxs px-1.5 py-0 h-4",
                  item.priority === 'high' && "border-red text-red",
                  item.priority === 'medium' && "border-yellow text-yellow",
                  item.priority === 'low' && "border-muted-foreground text-muted-foreground"
                )}
              >
                {item.priority}
              </Badge>
            </div>
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {item.name}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {item.trigger}
            </p>
          </div>

          {/* Time + Expand */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xxs text-muted-foreground">{formatTimeAgo(item.detectedAt)}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border">
            <div className="pt-3 space-y-2">
              {/* Trigger */}
              <div className="group/edit relative">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">What happened</p>
                {isEditingThis && editingField === 'trigger' ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm min-h-[50px] resize-none"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" className="h-6 text-xs gap-1" onClick={saveEdit}>
                        <Check className="w-3 h-3" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-foreground pr-6">{item.trigger}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(item.id, 'trigger', item.trigger); }}
                      className="absolute top-0 right-0 p-1 opacity-0 group-hover/edit:opacity-100 hover:bg-muted rounded"
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>

              {/* Evidence */}
              <div className="group/edit relative">
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Evidence</p>
                {isEditingThis && editingField === 'evidence' ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-sm min-h-[50px] resize-none"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" variant="default" className="h-6 text-xs gap-1" onClick={saveEdit}>
                        <Check className="w-3 h-3" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground pr-6">{item.evidence}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(item.id, 'evidence', item.evidence); }}
                      className="absolute top-0 right-0 p-1 opacity-0 group-hover/edit:opacity-100 hover:bg-muted rounded"
                    >
                      <Pencil className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>

              {/* Suggested Action */}
              {item.suggestedAction && (
                <div className="group/edit relative">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5">Suggested Action</p>
                  {isEditingThis && editingField === 'suggestedAction' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-sm min-h-[50px] resize-none"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="default" className="h-6 text-xs gap-1" onClick={saveEdit}>
                          <Check className="w-3 h-3" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-purple pr-6">{item.suggestedAction}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditing(item.id, 'suggestedAction', item.suggestedAction || ''); }}
                        className="absolute top-0 right-0 p-1 opacity-0 group-hover/edit:opacity-100 hover:bg-muted rounded"
                      >
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Stakeholder + Channel */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={stakeholder.avatar} />
                    <AvatarFallback className="text-xxs">{stakeholder.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {stakeholder.name} · {stakeholder.role}
                  </span>
                </div>
                <Badge variant="outline" className="text-xxs h-5">
                  {item.channel}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className={cn(
                  "flex-1 h-8 text-xs gap-1.5",
                  isRisk ? "bg-red hover:bg-red/90" : "bg-green hover:bg-green/90",
                  "text-white"
                )}
                onClick={(e) => { e.stopPropagation(); handleProcess(item); }}
              >
                <Database className="w-3.5 h-3.5" />
                {isRisk ? "Address Risk" : "Process Signal"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={(e) => { e.stopPropagation(); handleIgnore(item); }}
              >
                Ignore
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Empty state component
  const EmptyState = ({ type }: { type: 'risk' | 'signal' }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {type === 'risk' ? (
        <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mb-2" />
      ) : (
        <Zap className="w-8 h-8 text-muted-foreground/40 mb-2" />
      )}
      <p className="text-sm text-muted-foreground">
        No {type === 'risk' ? 'risks' : 'signals'} for this deal
      </p>
    </div>
  );

  const totalCount = risks.length + signals.length;

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <section className="space-y-4">
        {/* Section Header */}
        <CollapsibleTrigger asChild>
          <Card className="p-4 bg-gradient-to-r from-orange/5 to-red/5 border-l-4 border-l-orange cursor-pointer hover:bg-orange/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange/10">
                <AlertTriangle className="w-5 h-5 text-orange" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Signals & Risks</h2>
                  {totalCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {totalCount}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {risks.length} risk{risks.length !== 1 ? 's' : ''} · {signals.length} signal{signals.length !== 1 ? 's' : ''} detected
                </p>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          {/* Split Screen Layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Risks Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red" />
                  Risks ({risks.length})
                </span>
                {risks.length > 0 && (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-xxs px-2 text-red hover:text-red hover:bg-red/10"
                      onClick={() => handleProcessAll('risk')}
                    >
                      Address All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-xxs px-2 text-muted-foreground"
                      onClick={() => handleIgnoreAll('risk')}
                    >
                      Ignore All
                    </Button>
                  </div>
                )}
              </div>
              <Card className="overflow-hidden border-muted">
                <ScrollArea className="h-[320px]">
                  <div className="p-2 space-y-1.5">
                    {risks.length === 0 ? (
                      <EmptyState type="risk" />
                    ) : (
                      <>
                        {paginatedRisks.map((risk) => (
                          <SignalCard
                            key={risk.id}
                            item={risk}
                            isRisk={true}
                            isExpanded={expandedRiskId === risk.id}
                            onToggle={() => setExpandedRiskId(expandedRiskId === risk.id ? null : risk.id)}
                          />
                        ))}
                        {hasMoreRisks && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setRisksPage(p => p + 1)}
                          >
                            Show {Math.min(ITEMS_PER_PAGE, risks.length - risksPage * ITEMS_PER_PAGE)} more risks
                            <ChevronDown className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>

            {/* Signals Column */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-green" />
                  Signals ({signals.length})
                </span>
                {signals.length > 0 && (
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-xxs px-2 text-green hover:text-green hover:bg-green/10"
                      onClick={() => handleProcessAll('signal')}
                    >
                      Process All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 text-xxs px-2 text-muted-foreground"
                      onClick={() => handleIgnoreAll('signal')}
                    >
                      Ignore All
                    </Button>
                  </div>
                )}
              </div>
              <Card className="overflow-hidden border-muted">
                <ScrollArea className="h-[320px]">
                  <div className="p-2 space-y-1.5">
                    {signals.length === 0 ? (
                      <EmptyState type="signal" />
                    ) : (
                      <>
                        {paginatedSignals.map((signal) => (
                          <SignalCard
                            key={signal.id}
                            item={signal}
                            isRisk={false}
                            isExpanded={expandedSignalId === signal.id}
                            onToggle={() => setExpandedSignalId(expandedSignalId === signal.id ? null : signal.id)}
                          />
                        ))}
                        {hasMoreSignals && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setSignalsPage(p => p + 1)}
                          >
                            Show {Math.min(ITEMS_PER_PAGE, signals.length - signalsPage * ITEMS_PER_PAGE)} more signals
                            <ChevronDown className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
};
