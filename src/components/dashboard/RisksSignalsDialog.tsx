import { useState, useMemo, useEffect, useRef } from "react";
import { Clock, ChevronDown, ChevronUp, Database, X, ArrowUp, ArrowDown, FileText, Mail, Link2, Pencil, Check, ArrowRight, Zap, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useSignalsStore, DetectedSignal } from "@/stores/signalsStore";
import { useGeneratedActionsStore } from "@/stores/generatedActionsStore";
import { useSignalProcessor } from "@/hooks/useSignalProcessor";
import { deals, getCompanyById, getStakeholderById } from "@/data/dealData";
import { toast } from "@/hooks/use-toast";
import { CRITICAL_EVENT_LABELS } from "@/data/signalsData";
import salesforceLogo from "@/assets/logos/salesforce.svg";
import stripeLogo from "@/assets/logos/stripe.svg";
import shopifyLogo from "@/assets/logos/shopify.svg";
import hubspotLogo from "@/assets/logos/hubspot-sprocket.svg";
import slackLogo from "@/assets/logos/slack.svg";
import notionLogo from "@/assets/logos/notion.svg";
import figmaLogo from "@/assets/logos/figma.svg";

// Dashboard deals with logos
const dashboardDeals = [
  { name: "TechFlow Solutions", logo: salesforceLogo },
  { name: "CloudScale Inc", logo: stripeLogo },
  { name: "SecureBank Holdings", logo: shopifyLogo },
  { name: "RetailMax Corp", logo: hubspotLogo },
  { name: "GlobalTech Industries", logo: slackLogo },
  { name: "Acme Corp", logo: notionLogo },
  { name: "Salesforce", logo: salesforceLogo },
  { name: "Stripe", logo: stripeLogo },
  { name: "Shopify", logo: shopifyLogo },
  { name: "HubSpot", logo: hubspotLogo },
  { name: "Slack", logo: slackLogo },
  { name: "Notion", logo: notionLogo },
  { name: "Figma", logo: figmaLogo },
];

const getDealLogo = (dealName: string) => {
  return dashboardDeals.find(d => d.name === dealName)?.logo;
};

// Helper to format time ago
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

interface RisksSignalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "risks" | "signals";
}

const RisksSignalsDialog = ({ open, onOpenChange, defaultTab = "risks" }: RisksSignalsDialogProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"risks" | "signals">(defaultTab);
  const [expandedRiskId, setExpandedRiskId] = useState<string | null>(null);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [riskSortOrder, setRiskSortOrder] = useState<"high-first" | "low-first">("high-first");
  const [signalSortOrder, setSignalSortOrder] = useState<"urgent-first" | "recent-first">("urgent-first");
  const [riskDealFilter, setRiskDealFilter] = useState<string>("all");
  const [signalDealFilter, setSignalDealFilter] = useState<string>("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showIgnoreAllConfirm, setShowIgnoreAllConfirm] = useState(false);
  const [addedItemType, setAddedItemType] = useState<"risk" | "signal">("risk");
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'trigger' | 'evidence' | 'suggestedAction' | null>(null);
  const [editValue, setEditValue] = useState("");

  // Track pending undo timeouts
  const undoTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Get live data from signals store
  const { 
    getPendingRisks, 
    getPendingSignals, 
    ignoreSignal,
    unignoreSignal,
    ignoreAllSignals,
    updateSignal 
  } = useSignalsStore();
  
  // Get processing result for confirmation dialog
  const { lastProcessingResult, clearLastResult } = useGeneratedActionsStore();
  
  // Signal processor hook
  const { processSignalWithActions, processAllWithActions } = useSignalProcessor();

  const liveRisks = getPendingRisks();
  const liveSignals = getPendingSignals();

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      undoTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Get unique deal names from actual signals/risks for filtering
  const dealNamesFromSignals = useMemo(() => {
    const allItems = [...liveRisks, ...liveSignals];
    const names = new Set(allItems.map(item => item.dealName));
    return Array.from(names).sort();
  }, [liveRisks, liveSignals]);

  const filteredRisks = useMemo(() => {
    let risks = [...liveRisks];
    if (riskDealFilter !== "all") {
      risks = risks.filter(r => r.dealName === riskDealFilter);
    }
    risks.sort((a, b) => {
      // Critical events always first
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      
      if (riskSortOrder === "high-first") {
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      } else {
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      }
    });
    return risks;
  }, [liveRisks, riskDealFilter, riskSortOrder]);

  const filteredSignals = useMemo(() => {
    let signals = [...liveSignals];
    if (signalDealFilter !== "all") {
      signals = signals.filter(s => s.dealName === signalDealFilter);
    }
    signals.sort((a, b) => {
      // Critical events always first
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      
      if (signalSortOrder === "urgent-first") {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
      }
      return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
    });
    return signals;
  }, [liveSignals, signalDealFilter, signalSortOrder]);


  const handleAddToDatabase = (type: "risk" | "signal", id: string) => {
    const item = type === "risk" 
      ? liveRisks.find(r => r.id === id) 
      : liveSignals.find(s => s.id === id);
    
    if (item) {
      processSignalWithActions(item);
      setAddedItemType(type);
      setShowConfirmDialog(true);
    }
  };

  const handleIgnoreWithUndo = (type: "risk" | "signal", id: string, itemName: string) => {
    // Immediately ignore
    ignoreSignal(id);
    
    // Clear any existing timeout for this item
    const existingTimeout = undoTimeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Show toast with undo
    const { dismiss } = toast({
      title: `${type === "risk" ? "Risk" : "Signal"} ignored`,
      description: itemName.slice(0, 50) + (itemName.length > 50 ? "..." : ""),
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Cancel the timeout
            const timeout = undoTimeoutsRef.current.get(id);
            if (timeout) {
              clearTimeout(timeout);
              undoTimeoutsRef.current.delete(id);
            }
            // Restore the signal
            unignoreSignal(id);
            dismiss();
            toast({
              title: `${type === "risk" ? "Risk" : "Signal"} restored`,
              description: "The item has been moved back to pending.",
            });
          }}
          className="h-7 text-xs"
        >
          Undo
        </Button>
      ),
      duration: 5000,
    });

    // Set timeout to finalize
    const timeout = setTimeout(() => {
      undoTimeoutsRef.current.delete(id);
    }, 5000);
    
    undoTimeoutsRef.current.set(id, timeout);
  };

  const confirmIgnoreAll = () => {
    const items = activeTab === "risks" ? filteredRisks : filteredSignals;
    const count = items.length;
    
    if (activeTab === "risks") {
      ignoreAllSignals("risk");
    } else {
      ignoreAllSignals("signal");
    }
    
    toast({
      title: `${count} ${activeTab} ignored`,
      description: "All items have been moved to History.",
    });
    
    setShowIgnoreAllConfirm(false);
  };

  const handleAddAllToDatabase = () => {
    const type = activeTab === "risks" ? "risk" : "signal";
    processAllWithActions(type);
    setAddedItemType(type);
    setShowConfirmDialog(true);
  };

  const handleShowUpdatedActions = () => {
    clearLastResult();
    setShowConfirmDialog(false);
    onOpenChange(false);
    navigate("/action-hub");
  };

  const handleDismissConfirm = () => {
    clearLastResult();
    setShowConfirmDialog(false);
  };

  // Editing handlers
  const startEditing = (id: string, field: 'trigger' | 'evidence' | 'suggestedAction', currentValue: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const saveEdit = () => {
    if (editingId && editingField) {
      updateSignal(editingId, { [editingField]: editValue });
      toast({
        title: "Updated",
        description: `${editingField === 'trigger' ? 'Content' : editingField === 'evidence' ? 'Evidence' : 'Suggested action'} has been updated.`,
      });
    }
    setEditingId(null);
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setEditValue("");
  };

  // Helper to get stakeholder display info
  const getStakeholderInfo = (signal: DetectedSignal) => {
    if (signal.stakeholder) {
      return {
        name: signal.stakeholder.name,
        role: signal.stakeholder.role,
        avatar: signal.stakeholder.avatar,
        initials: signal.stakeholder.name.split(' ').map(n => n[0]).join('')
      };
    }
    return {
      name: 'Unknown',
      role: 'Contact',
      avatar: undefined,
      initials: 'UN'
    };
  };

  // Editable field component
  const EditableField = ({ 
    id, 
    field, 
    value, 
    label, 
    className 
  }: { 
    id: string; 
    field: 'trigger' | 'evidence' | 'suggestedAction'; 
    value: string; 
    label?: string;
    className?: string;
  }) => {
    const isEditing = editingId === id && editingField === field;
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          {label && <p className="text-sm font-medium mb-1">{label}</p>}
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="text-sm min-h-[60px] resize-none"
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
      );
    }
    
    return (
      <div className={cn("group/edit relative", className)}>
        {label && <p className="text-sm font-medium mb-1">{label}</p>}
        <p className="text-sm text-muted-foreground pr-6">{value}</p>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "risks" | "signals")} className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="px-4 pt-3 pb-2 pr-14">
            <DialogTitle className="text-lg font-semibold mb-2">
              {activeTab === "risks" ? "Active Deal Risks" : "Signals Intelligence"}
            </DialogTitle>
            
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 mb-2">
              <TabsTrigger value="risks" className="data-[state=active]:bg-white gap-1.5">
                Risks <span className="text-red font-semibold">{liveRisks.length}</span>
              </TabsTrigger>
              <TabsTrigger value="signals" className="data-[state=active]:bg-white gap-1.5">
                Signals <span className="text-primary font-semibold">{liveSignals.length}</span>
              </TabsTrigger>
            </TabsList>

            {/* Filters inline */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => activeTab === "risks" 
                  ? setRiskSortOrder(riskSortOrder === "high-first" ? "low-first" : "high-first")
                  : setSignalSortOrder(signalSortOrder === "urgent-first" ? "recent-first" : "urgent-first")
                }
                className="h-8 px-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded border bg-background transition-colors"
              >
                {activeTab === "risks" ? (
                  riskSortOrder === "high-first" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                  signalSortOrder === "urgent-first" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />
                )}
                {activeTab === "risks" 
                  ? (riskSortOrder === "high-first" ? "High first" : "Low first")
                  : (signalSortOrder === "urgent-first" ? "Urgent first" : "Recent first")
                }
              </button>
              <Select value={activeTab === "risks" ? riskDealFilter : signalDealFilter} onValueChange={activeTab === "risks" ? setRiskDealFilter : setSignalDealFilter}>
                <SelectTrigger className="h-8 w-32 bg-background text-sm">
                  <SelectValue placeholder="All Deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  {dealNamesFromSignals.map(deal => (
                    <SelectItem key={deal} value={deal}>{deal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Risks Tab */}
            <TabsContent value="risks" className="m-0 p-3 space-y-2">
              {filteredRisks.map((risk) => {
                const stakeholder = getStakeholderInfo(risk);
                const isCritical = risk.severity === 'critical';
                return (
                  <div 
                    key={risk.id} 
                    className={cn(
                      "border rounded-lg bg-card hover:shadow-sm transition-shadow",
                      isCritical && "border-red/40 bg-red/5 ring-1 ring-red/20"
                    )}
                  >
                    <button
                      className="w-full p-3 flex items-start gap-3 text-left"
                      onClick={() => setExpandedRiskId(expandedRiskId === risk.id ? null : risk.id)}
                    >
                      {/* Avatar with optional critical indicator */}
                      <div className="relative shrink-0">
                        <Avatar className="w-8 h-8 mt-0.5">
                          <AvatarImage src={stakeholder.avatar} />
                          <AvatarFallback className="bg-muted text-xs">
                            {stakeholder.initials}
                          </AvatarFallback>
                        </Avatar>
                        {isCritical && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red flex items-center justify-center ring-2 ring-background">
                            <Zap className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Critical badge and category */}
                        {isCritical && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge className="bg-red text-white text-xxs px-1.5 py-0 font-semibold animate-pulse">
                              CRITICAL
                            </Badge>
                            {risk.eventCategory && (
                              <Badge variant="outline" className="text-xxs px-1.5 py-0 border-red/30 text-red">
                                {CRITICAL_EVENT_LABELS[risk.eventCategory] || risk.eventCategory}
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className={cn("text-base font-medium line-clamp-2", isCritical && "font-semibold")}>{risk.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{risk.trigger}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground">{stakeholder.name}</span>
                          {!isCritical && risk.isUrgent && <Badge className="bg-red/10 text-red border-red/20 text-xxs px-1.5 py-0">Urgent</Badge>}
                          {!isCritical && (
                            <Badge className={cn("text-xxs px-1.5 py-0", risk.priority === "high" ? "bg-red/10 text-red border-red/20" : "bg-muted text-muted-foreground")}>
                              {risk.priority === "high" ? "High" : "Low"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-muted-foreground" title="Evidence sources">
                          <Mail className="w-3.5 h-3.5" />
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={getDealLogo(risk.dealName)} className="object-contain p-0.5" />
                          <AvatarFallback className="text-xxs bg-muted">{risk.dealName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {expandedRiskId === risk.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {expandedRiskId === risk.id && (
                      <div className="px-3 pb-3 pt-0 border-t">
                        <div className="pt-3 space-y-3">
                          {/* Score impact for critical events */}
                          {isCritical && (
                            <div className="bg-red/10 border border-red/20 rounded p-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red shrink-0" />
                              <span className="text-sm text-red font-medium">
                                Critical Impact: This event may significantly affect deal outcome (-10-15% win probability if unaddressed)
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Detected {formatTimeAgo(risk.detectedAt)}</span>
                            <span>·</span>
                            <span>{risk.confidence}% confidence</span>
                            {risk.channel && (
                              <>
                                <span>·</span>
                                <span>via {risk.channel}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Editable Trigger */}
                          <div className="bg-muted/50 border rounded p-2">
                            <EditableField 
                              id={risk.id} 
                              field="trigger" 
                              value={risk.trigger} 
                              label="Content"
                            />
                          </div>
                          
                          {/* Editable Evidence */}
                          <div className="bg-red/5 border border-red/20 rounded p-2">
                            <EditableField 
                              id={risk.id} 
                              field="evidence" 
                              value={risk.evidence} 
                              label="Evidence"
                              className="[&_p:first-child]:text-red"
                            />
                          </div>
                          
                          {/* Editable Suggested Action */}
                          {risk.suggestedAction && (
                            <div className="bg-green/5 border border-green/20 rounded p-2">
                              <EditableField 
                                id={risk.id} 
                                field="suggestedAction" 
                                value={risk.suggestedAction} 
                                label="Suggested Action"
                                className="[&_p:first-child]:text-green"
                              />
                            </div>
                          )}
                          
                          {/* Action buttons - different for critical vs normal */}
                          <div className="flex items-center gap-2 pt-2">
                            {isCritical ? (
                              <>
                                <Button size="sm" className="h-7 text-xs gap-1.5 bg-green hover:bg-green/90" onClick={() => handleAddToDatabase("risk", risk.id)}>
                                  <Check className="w-3 h-3" /> Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 text-xs gap-1.5" 
                                  onClick={() => startEditing(risk.id, 'trigger', risk.trigger)}
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs gap-1.5 text-red hover:text-red hover:bg-red/10" 
                                  onClick={() => handleIgnoreWithUndo("risk", risk.id, risk.trigger)}
                                >
                                  <X className="w-3 h-3" /> Dismiss
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => handleAddToDatabase("risk", risk.id)}>
                                  <Database className="w-3 h-3" /> Add to DB
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs gap-1.5" 
                                  onClick={() => handleIgnoreWithUndo("risk", risk.id, risk.trigger)}
                                >
                                  <X className="w-3 h-3" /> Ignore
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredRisks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No risks detected. The simulation will generate new signals over time.
                </div>
              )}
            </TabsContent>

            {/* Signals Tab */}
            <TabsContent value="signals" className="m-0 p-3 space-y-2">
              {filteredSignals.map((signal) => {
                const stakeholder = getStakeholderInfo(signal);
                const isCritical = signal.severity === 'critical';
                return (
                  <div 
                    key={signal.id} 
                    className={cn(
                      "border rounded-lg bg-card hover:shadow-sm transition-shadow",
                      isCritical && "border-green/40 bg-green/5 ring-1 ring-green/20"
                    )}
                  >
                    <button
                      className="w-full p-3 flex items-start gap-3 text-left"
                      onClick={() => setExpandedSignalId(expandedSignalId === signal.id ? null : signal.id)}
                    >
                      {/* Avatar with optional critical indicator */}
                      <div className="relative shrink-0">
                        <Avatar className="w-8 h-8 mt-0.5">
                          <AvatarImage src={stakeholder.avatar} />
                          <AvatarFallback className="bg-muted text-xs">
                            {stakeholder.initials}
                          </AvatarFallback>
                        </Avatar>
                        {isCritical && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green flex items-center justify-center ring-2 ring-background">
                            <Zap className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Critical badge and category */}
                        {isCritical && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge className="bg-green text-white text-xxs px-1.5 py-0 font-semibold animate-pulse">
                              CRITICAL
                            </Badge>
                            {signal.eventCategory && (
                              <Badge variant="outline" className="text-xxs px-1.5 py-0 border-green/30 text-green">
                                {CRITICAL_EVENT_LABELS[signal.eventCategory] || signal.eventCategory}
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className={cn("text-base font-medium line-clamp-2", isCritical && "font-semibold")}>{signal.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{signal.trigger}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-sm text-muted-foreground">{stakeholder.name}</span>
                          {!isCritical && signal.isUrgent && <Badge className="bg-red/10 text-red border-red/20 text-xxs px-1.5 py-0">Urgent</Badge>}
                          {!isCritical && (
                            <Badge className={cn("text-xxs px-1.5 py-0",
                              signal.sentiment === "positive" ? "bg-green/10 text-green border-green/20"
                                : signal.sentiment === "negative" ? "bg-red/10 text-red border-red/20"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {signal.sentiment ? signal.sentiment.charAt(0).toUpperCase() + signal.sentiment.slice(1) : 'Neutral'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 text-muted-foreground" title="Evidence sources">
                          <Mail className="w-3.5 h-3.5" />
                          <Link2 className="w-3.5 h-3.5" />
                        </div>
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={getDealLogo(signal.dealName)} className="object-contain p-0.5" />
                          <AvatarFallback className="text-xxs bg-muted">{signal.dealName.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {expandedSignalId === signal.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {expandedSignalId === signal.id && (
                      <div className="px-3 pb-3 pt-0 border-t">
                        <div className="pt-3 space-y-3">
                          {/* Score impact for critical events */}
                          {isCritical && (
                            <div className="bg-green/10 border border-green/20 rounded p-2 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-green shrink-0" />
                              <span className="text-sm text-green font-medium">
                                Major Opportunity: This event can significantly boost deal momentum (+10-15% win probability)
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Detected {formatTimeAgo(signal.detectedAt)}</span>
                            <span>·</span>
                            <span>{signal.confidence}% confidence</span>
                            <span>·</span>
                            <span>via {signal.channel}</span>
                          </div>
                          
                          {/* Editable Trigger */}
                          <div className="bg-muted/50 border rounded p-2">
                            <EditableField 
                              id={signal.id} 
                              field="trigger" 
                              value={signal.trigger} 
                              label="Content"
                            />
                          </div>
                          
                          {/* Editable Evidence */}
                          <div className={cn(
                            "border rounded p-2",
                            isCritical ? "bg-green/5 border-green/20" : "bg-primary/5 border-primary/20"
                          )}>
                            <EditableField 
                              id={signal.id} 
                              field="evidence" 
                              value={signal.evidence} 
                              label="Evidence"
                              className={isCritical ? "[&_p:first-child]:text-green" : "[&_p:first-child]:text-primary"}
                            />
                          </div>
                          
                          {/* Editable Suggested Action */}
                          {signal.suggestedAction && (
                            <div className="bg-green/5 border border-green/20 rounded p-2">
                              <EditableField 
                                id={signal.id} 
                                field="suggestedAction" 
                                value={signal.suggestedAction} 
                                label="Suggested Action"
                                className="[&_p:first-child]:text-green"
                              />
                            </div>
                          )}
                          
                          {/* Action buttons - different for critical vs normal */}
                          <div className="flex items-center gap-2 pt-2">
                            {isCritical ? (
                              <>
                                <Button size="sm" className="h-7 text-xs gap-1.5 bg-green hover:bg-green/90" onClick={() => handleAddToDatabase("signal", signal.id)}>
                                  <Check className="w-3 h-3" /> Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-7 text-xs gap-1.5" 
                                  onClick={() => startEditing(signal.id, 'trigger', signal.trigger)}
                                >
                                  <Pencil className="w-3 h-3" /> Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs gap-1.5" 
                                  onClick={() => handleIgnoreWithUndo("signal", signal.id, signal.trigger)}
                                >
                                  <X className="w-3 h-3" /> Dismiss
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => handleAddToDatabase("signal", signal.id)}>
                                  <Database className="w-3 h-3" /> Add to DB
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-7 text-xs gap-1.5" 
                                  onClick={() => handleIgnoreWithUndo("signal", signal.id, signal.trigger)}
                                >
                                  <X className="w-3 h-3" /> Ignore
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredSignals.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No signals detected. The simulation will generate new signals over time.
                </div>
              )}
            </TabsContent>
          </div>

          {/* Footer with bulk actions */}
          <div className="border-t px-4 py-3 flex items-center justify-between bg-muted/30 shrink-0">
            <span className="text-sm text-muted-foreground">
              {activeTab === "risks" ? `${filteredRisks.length} risks` : `${filteredSignals.length} signals`}
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowIgnoreAllConfirm(true)}
                disabled={activeTab === "risks" ? filteredRisks.length === 0 : filteredSignals.length === 0}
              >
                Ignore All {activeTab === "risks" ? "Risks" : "Signals"}
              </Button>
              <Button 
                size="sm"
                onClick={handleAddAllToDatabase}
                disabled={activeTab === "risks" ? filteredRisks.length === 0 : filteredSignals.length === 0}
              >
                Add All to DB
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>

      {/* Add to Database Confirmation Dialog - Enhanced with action list */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              {addedItemType === "risk" ? "Risk" : "Signal"} Added to Database
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green font-medium">+{lastProcessingResult?.actionsAdded || 2}</span>
                    <span className="text-foreground">actions added</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-medium">{lastProcessingResult?.actionsModified || 5}</span>
                    <span className="text-foreground">modified</span>
                  </div>
                </div>
                
                {/* List of generated actions */}
                {lastProcessingResult?.actions && lastProcessingResult.actions.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">New Actions Created:</p>
                    {lastProcessingResult.actions.slice(0, 3).map((action, idx) => {
                      const stakeholder = action.stakeholderIds[0] ? getStakeholderById(action.stakeholderIds[0]) : null;
                      return (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                            action.priority === "high" ? "bg-red" : action.priority === "medium" ? "bg-yellow" : "bg-muted-foreground"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground line-clamp-1">{action.title}</p>
                            {stakeholder && (
                              <p className="text-muted-foreground text-xs">
                                {stakeholder.name} · {action.type === "email" ? "Email" : "Meeting"} · {action.deadline}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {lastProcessingResult.actions.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{lastProcessingResult.actions.length - 3} more actions
                      </p>
                    )}
                  </div>
                )}
                
                <p className="text-sm text-foreground">
                  Probability and alignment scores have been updated
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
            <AlertDialogCancel onClick={handleDismissConfirm}>Dismiss</AlertDialogCancel>
            <AlertDialogAction onClick={handleShowUpdatedActions} className="gap-1.5">
              Show Updated Actions
              <ArrowRight className="w-3.5 h-3.5" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ignore All Confirmation Dialog */}
      <AlertDialog open={showIgnoreAllConfirm} onOpenChange={setShowIgnoreAllConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              Ignore all {activeTab}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will move {activeTab === "risks" ? filteredRisks.length : filteredSignals.length} {activeTab} to History. You can review them later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmIgnoreAll}>
              Ignore All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default RisksSignalsDialog;
