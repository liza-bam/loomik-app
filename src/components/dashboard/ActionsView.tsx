import { useState, useEffect, useRef, Fragment, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, Mail, Video, Archive, ChevronRight, ChevronDown, ArrowUpNarrowWide, ArrowDownNarrowWide, Undo2, FileText, File, Users, Calendar, Sparkles } from "lucide-react";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";
import SummaryBox from "@/components/ui/summary-box";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsTablet } from "@/hooks/use-mobile";
import ActionEmailDialog from "./ActionEmailDialog";
import ActionMeetingDialog from "./ActionMeetingDialog";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import { FilterBar, FilterBarLeft, FilterBarRight } from "./FilterBar";
import ActionCard, { DisplayAction } from "./ActionCard";
import { useActionsStore } from "@/stores/actionsStore";
import { useSearchStore } from "@/stores/searchStore";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";
import { useGeneratedActionsStore } from "@/stores/generatedActionsStore";
import { useUIStore } from "@/stores/uiStore";
import {
  getAllActionsWithStakeholders,
  getProgressColor,
  avatarColors,
  getStakeholderById,
  deals,
  getCompanyById,
} from "@/data/dealData";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

// Deal metadata for display
// Company logos for display (keyed by company name)
const companyLogos: Record<string, string> = {
  "Salesforce": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png",
  "Stripe": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1280px-Stripe_Logo%2C_revised_2016.svg.png",
  "Shopify": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Shopify_logo_2018.svg/1280px-Shopify_logo_2018.svg.png",
  "HubSpot": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/HubSpot_Logo.svg/1280px-HubSpot_Logo.svg.png",
  "Slack": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/1024px-Slack_icon_2019.svg.png",
  "Notion": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/1024px-Notion-logo.svg.png",
  "Figma": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Figma-logo.svg/1024px-Figma-logo.svg.png",
};

// Map centralized data to display format (static actions only)
const getStaticDisplayActions = (): DisplayAction[] => {
  const actionsWithStakeholders = getAllActionsWithStakeholders();
  
  return actionsWithStakeholders.map(action => {
    const deal = deals.find(d => d.id === action.dealId);
    return {
      id: action.id,
      title: action.title,
      stakeholders: action.stakeholders.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        avatar: s.avatar,
      })),
      artifact: action.artifact,
      basedOn: action.basedOn,
      priority: action.priority,
      type: action.type,
      deadline: action.deadline,
      dealName: action.dealName,
      dealValue: deal?.value || "$0",
      companyName: action.companyName,
      companyLogo: action.companyLogo,
      winProbability: action.winProbability,
      isGenerated: false,
    };
  });
};

const getPriorityStyles = (priority: "high" | "medium" | "low", isActive: boolean) => {
  const base = "transition-all duration-200";
  if (priority === "high") {
    return isActive ? `${base} bg-red text-white` : `${base} bg-muted text-muted-foreground hover:bg-red/20 hover:text-red`;
  }
  if (priority === "medium") {
    return isActive ? `${base} bg-yellow text-white` : `${base} bg-muted text-muted-foreground hover:bg-yellow/20 hover:text-yellow`;
  }
  return isActive ? `${base} bg-slate-500 text-white` : `${base} bg-muted text-muted-foreground hover:bg-slate-200 hover:text-slate-600`;
};

// AI reasoning generator based on action context
const getAIReasoning = (action: DisplayAction): string => {
  const reasonings: Record<string, string> = {
    "high": `${action.stakeholders[0]?.name || "The stakeholder"} has shown signs of concern that need immediate attention. Addressing this promptly will help maintain momentum and prevent the deal from stalling.`,
    "medium": `This is a strategic touchpoint to reinforce value and keep ${action.stakeholders[0]?.name || "the stakeholder"} engaged. Regular communication at this stage helps build trust and alignment.`,
    "low": `A routine follow-up to maintain relationship warmth. While not urgent, consistent engagement helps ensure long-term partnership success.`,
  };
  return reasonings[action.priority] || reasonings.medium;
};

// Mock attachments for actions
const getActionAttachments = (action: DisplayAction) => {
  const baseAttachments = [
    { name: "Problem Statement Brief", type: "pdf" },
    { name: "Value Summary", type: "docx" },
  ];
  
  if (action.priority === "high") {
    baseAttachments.push({ name: "ROI Analysis", type: "xlsx" });
  }
  
  return baseAttachments;
};

const ActionsView = () => {
  const [searchParams] = useSearchParams();
  const urlDealFilter = searchParams.get("deal");
  
  const { query: searchQuery } = useSearchStore();
  const { actions: generatedActions } = useGeneratedActionsStore();
  const { isAIPanelOpen } = useUIStore();
  const isTablet = useIsTablet();
  
  const [localRemovedIds, setLocalRemovedIds] = useState<number[]>([]);
  const [userViewMode, setUserViewMode] = useState<"list" | "cards">("list");
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [dealFilter, setDealFilter] = useState<string>(urlDealFilter || "all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "company">("deadline");
  const [sortAsc, setSortAsc] = useState(true);
  
  const [selectedAction, setSelectedAction] = useState<DisplayAction | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [actionToArchive, setActionToArchive] = useState<DisplayAction | null>(null);
  const [pendingDoneAction, setPendingDoneAction] = useState<DisplayAction | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Expanded row state
  const [expandedActionId, setExpandedActionId] = useState<number | null>(null);
  
  // Force cards view on tablet when AI panel is open
  const isTabletCompact = isTablet && isAIPanelOpen;
  const viewMode = isTabletCompact ? "cards" : userViewMode;
  const setViewMode = setUserViewMode;

  const { archiveAction, markAsDone } = useActionsStore();
  const { toast } = useToast();
  
  // Merge static actions with generated actions from signals/risks
  const allActions = useMemo(() => {
    const staticActions = getStaticDisplayActions();
    
    // Transform generated actions to display format
    const transformedGeneratedActions: DisplayAction[] = generatedActions
      .filter(ga => ga.status === "pending")
      .map((ga, index) => {
        const deal = deals.find(d => d.id === ga.dealId);
        const company = deal ? getCompanyById(deal.companyId) : null;
        const companyName = company?.name || "Unknown";
        
        return {
          // Use negative IDs for generated actions to avoid collision with static action IDs
          id: -(index + 1000000 + ga.id),
          title: ga.title,
          stakeholders: ga.stakeholderIds.map(sid => {
            const s = getStakeholderById(sid);
            return s ? { id: s.id, name: s.name, role: s.role, avatar: s.avatar } : { id: sid, name: "Unknown", role: "Contact" };
          }),
          artifact: ga.artifact,
          basedOn: ga.basedOn,
          priority: ga.priority,
          type: ga.type,
          deadline: ga.deadline,
          // Use actual deal data for consistency
          dealName: deal?.name || "Unknown Deal",
          dealValue: deal?.value || "$0",
          companyName,
          companyLogo: companyLogos[companyName] || company?.logo || "",
          winProbability: deal?.winProbability || 75,
          isGenerated: true,
        };
      });
    
    // Combine: generated actions first (most recent), then static
    // Filter out removed IDs
    return [...transformedGeneratedActions, ...staticActions].filter(
      a => !localRemovedIds.includes(a.id)
    );
  }, [generatedActions, localRemovedIds]);

  // Update filter when URL changes
  useEffect(() => {
    if (urlDealFilter) {
      setDealFilter(urlDealFilter);
    }
  }, [urlDealFilter]);

  const togglePriority = (priority: string) => {
    setPriorityFilter(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleExpand = (actionId: number) => {
    setExpandedActionId(expandedActionId === actionId ? null : actionId);
  };

  // Filter actions - memoize to ensure re-computation on filter changes
  // Filter actions - memoize to ensure re-computation on filter changes
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      // Priority filter: if any priorities selected, action must match one of them
      if (priorityFilter.length > 0) {
        const actionPriority = action.priority?.toLowerCase() as "high" | "medium" | "low";
        if (!priorityFilter.includes(actionPriority)) return false;
      }
      // Type filter
      if (typeFilter.length > 0 && !typeFilter.includes(action.type)) return false;
      // Deal filter
      if (dealFilter !== "all" && action.dealName !== dealFilter) return false;
      // Company filter
      if (companyFilter !== "all" && action.companyName !== companyFilter) return false;
      // Search filter
      if (searchQuery && !action.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allActions, priorityFilter, typeFilter, dealFilter, companyFilter, searchQuery]);

  // Sort actions - memoize to ensure re-computation on changes
  const sortedActions = useMemo(() => {
    return [...filteredActions].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "deadline") {
        const deadlineOrder: Record<string, number> = { "Today": 0, "Tomorrow": 1 };
        const aOrder = deadlineOrder[a.deadline] ?? 2;
        const bOrder = deadlineOrder[b.deadline] ?? 2;
        if (aOrder !== bOrder) {
          comparison = aOrder - bOrder;
        } else {
          comparison = a.deadline.localeCompare(b.deadline);
        }
      } else if (sortBy === "priority") {
        const priorityOrder: Record<string, number> = { "high": 0, "medium": 1, "low": 2 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "company") {
        comparison = a.companyName.localeCompare(b.companyName);
      }
      
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredActions, sortBy, sortAsc]);

  const handleGoToAction = (action: DisplayAction) => {
    setSelectedAction(action);
    if (action.type === "email") {
      setEmailDialogOpen(true);
    } else {
      setMeetingDialogOpen(true);
    }
  };

  const handleNextAction = () => {
    if (!selectedAction) return;
    const currentIndex = sortedActions.findIndex(a => a.id === selectedAction.id);
    const nextAction = sortedActions[currentIndex + 1];
    if (nextAction) {
      setEmailDialogOpen(false);
      setMeetingDialogOpen(false);
      setTimeout(() => {
        setSelectedAction(nextAction);
        if (nextAction.type === "email") {
          setEmailDialogOpen(true);
        } else {
          setMeetingDialogOpen(true);
        }
      }, 100);
    }
  };

  const hasNextAction = () => {
    if (!selectedAction) return false;
    const currentIndex = sortedActions.findIndex(a => a.id === selectedAction.id);
    return currentIndex < sortedActions.length - 1;
  };

  const handleArchiveClick = (action: DisplayAction) => {
    setActionToArchive(action);
    setArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = () => {
    if (actionToArchive) {
      archiveAction({
        id: actionToArchive.id,
        title: actionToArchive.title,
        stakeholders: actionToArchive.stakeholders,
        artifact: actionToArchive.artifact,
        basedOn: actionToArchive.basedOn,
        priority: actionToArchive.priority,
        type: actionToArchive.type,
        deadline: actionToArchive.deadline,
        dealName: actionToArchive.dealName,
        dealValue: actionToArchive.dealValue,
        companyName: actionToArchive.companyName,
        companyLogo: actionToArchive.companyLogo,
        winProbability: actionToArchive.winProbability,
        status: "archived",
        completedAt: new Date(),
      });
      setLocalRemovedIds(prev => [...prev, actionToArchive.id]);
    }
    setArchiveDialogOpen(false);
    setActionToArchive(null);
  };

  const handleDialogArchive = () => {
    if (selectedAction) {
      archiveAction({
        id: selectedAction.id,
        title: selectedAction.title,
        stakeholders: selectedAction.stakeholders,
        artifact: selectedAction.artifact,
        basedOn: selectedAction.basedOn,
        priority: selectedAction.priority,
        type: selectedAction.type,
        deadline: selectedAction.deadline,
        dealName: selectedAction.dealName,
        dealValue: selectedAction.dealValue,
        companyName: selectedAction.companyName,
        companyLogo: selectedAction.companyLogo,
        winProbability: selectedAction.winProbability,
        status: "archived",
        completedAt: new Date(),
      });
      setLocalRemovedIds(prev => [...prev, selectedAction.id]);
      setEmailDialogOpen(false);
      setMeetingDialogOpen(false);
    }
  };

  const handleMarkDone = () => {
    if (selectedAction) {
      const actionToComplete = selectedAction;
      
      setLocalRemovedIds(prev => [...prev, actionToComplete.id]);
      setPendingDoneAction(actionToComplete);
      
      setEmailDialogOpen(false);
      setMeetingDialogOpen(false);
      
      toast({
        title: "Action marked as done",
        description: (
          <div className="flex items-center gap-2">
            <span>This action will be moved to history.</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1"
              onClick={handleUndoDone}
            >
              <Undo2 className="w-3 h-3" />
              Undo
            </Button>
          </div>
        ),
        duration: 5000,
      });
      
      undoTimeoutRef.current = setTimeout(() => {
        finalizeDoneAction(actionToComplete);
      }, 5000);
    }
  };

  const handleUndoDone = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    
    if (pendingDoneAction) {
      setLocalRemovedIds(prev => prev.filter(id => id !== pendingDoneAction.id));
      setPendingDoneAction(null);
      
      toast({
        title: "Action restored",
        description: "The action has been restored to your list.",
      });
    }
  };

  const finalizeDoneAction = (action: DisplayAction) => {
    markAsDone({
      id: action.id,
      title: action.title,
      stakeholders: action.stakeholders,
      artifact: action.artifact,
      basedOn: action.basedOn,
      priority: action.priority,
      type: action.type,
      deadline: action.deadline,
      dealName: action.dealName,
      dealValue: action.dealValue,
      companyName: action.companyName,
      companyLogo: action.companyLogo,
      winProbability: action.winProbability,
      status: "done",
      completedAt: new Date(),
    });
    setPendingDoneAction(null);
  };

  const getTypeStyles = (isActive: boolean) => {
    const base = "transition-all duration-200";
    return isActive 
      ? `${base} bg-muted-foreground/20 text-foreground ring-1 ring-muted-foreground/40` 
      : `${base} bg-muted text-muted-foreground hover:bg-muted-foreground/10`;
  };

  const toggleType = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Check if we're in tablet with AI panel open
  const isTabletWithAI = isTablet && isAIPanelOpen;

  return (
    <div className="space-y-0">
      {/* Controls - matching Dashboard style */}
      <Card className={`p-0 overflow-hidden ${viewMode === "list" ? "rounded-b-none border-b-0" : "mb-4"}`}>
        <FilterBar className={isTabletWithAI ? "flex-col items-stretch gap-3" : ""}>
          <FilterBarLeft className={isTabletWithAI ? "w-full" : ""}>
            {/* Priority Buttons */}
            <div className="flex items-center gap-1">
              {["high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityStyles(p as "high" | "medium" | "low", priorityFilter.includes(p))}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Type Pills - icons only */}
            <div className="flex items-center gap-1">
              {(["email", "meeting"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`p-1.5 rounded-full ${getTypeStyles(typeFilter.length === 0 || typeFilter.includes(t))}`}
                  title={t}
                >
                  {t === "email" ? <Mail className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>

            {/* Deals Select */}
            <Select value={dealFilter} onValueChange={setDealFilter}>
              <SelectTrigger className="min-w-[120px] max-w-48 h-9 bg-muted border-0 rounded-lg">
                <SelectValue placeholder="Deal" className="truncate" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="all">All Deals</SelectItem>
                {[...new Set(allActions.map(a => a.dealName))].map((dealName) => (
                  <SelectItem key={dealName} value={dealName}>{dealName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Company Filter */}
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="min-w-[140px] max-w-48 h-9 bg-muted border-0 rounded-lg">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="all">All Companies</SelectItem>
                {[...new Set(allActions.map(a => a.companyName))].sort().map((companyName) => (
                  <SelectItem key={companyName} value={companyName}>{companyName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterBarLeft>

          <FilterBarRight className={isTabletWithAI ? "w-full justify-start" : ""}>
            {/* Sort - hidden on smaller screens, or shown on tablet 2-row layout */}
            <div className={`${isTabletWithAI ? "flex" : "hidden xl:flex"} items-center gap-2`}>
              <span className="text-sm text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as "deadline" | "priority" | "company")}>
                <SelectTrigger className="w-28 bg-muted border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border z-50">
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
              <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center w-9 h-9 bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors"
              >
                {sortAsc ? <ArrowUpNarrowWide className="w-4 h-4" /> : <ArrowDownNarrowWide className="w-4 h-4" />}
              </button>
            </div>

            {/* Count + View Toggle - hide toggle on tablet with AI panel open */}
            <div className="flex items-center gap-3">
              <span className={`${isTabletWithAI ? "inline" : "hidden xl:inline"} text-sm text-muted-foreground`}>{sortedActions.length} actions</span>
              {!isTabletWithAI && (
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-gradient-to-r from-purple to-orange text-white" : "bg-transparent hover:bg-muted/50"}`}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    className={`p-2 transition-colors ${viewMode === "cards" ? "bg-gradient-to-r from-purple to-orange text-white" : "bg-transparent hover:bg-muted/50"}`}
                    onClick={() => setViewMode("cards")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </FilterBarRight>
        </FilterBar>
      </Card>

      {/* Actions List - inside the card */}
      {viewMode === "list" && (
        <Card className="p-0 overflow-hidden rounded-t-none">
          <div className="divide-y divide-border">
            {sortedActions.map((action) => (
              <Fragment key={action.isGenerated ? `gen-${action.id}` : action.id}>
                <ActionListItem 
                  action={action} 
                  isExpanded={expandedActionId === action.id}
                  isGenerated={action.isGenerated}
                  onToggleExpand={() => toggleExpand(action.id)}
                  onGoToAction={handleGoToAction}
                  onArchive={handleArchiveClick}
                />
                {expandedActionId === action.id && (
                  <ActionExpandedContent 
                    action={action}
                    onGoToAction={() => handleGoToAction(action)}
                    onArchive={() => handleArchiveClick(action)}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </Card>
      )}

      {/* Cards View - outside the card, directly on background */}
      {viewMode === "cards" && (
        <div>
          <div className={`grid gap-4 ${isTabletCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
            {sortedActions.map((action) => (
              <ActionCard 
                key={action.isGenerated ? `gen-${action.id}` : action.id} 
                action={action} 
                isGenerated={action.isGenerated}
                onGoToAction={handleGoToAction}
                onArchive={handleArchiveClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ActionEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        action={selectedAction ? {
          id: selectedAction.id,
          stakeholderIds: selectedAction.stakeholders.map(s => s.id),
          stakeholderName: selectedAction.stakeholders[0]?.name || "",
          stakeholderRole: selectedAction.stakeholders[0]?.role || "",
          artifact: selectedAction.artifact,
          basedOn: selectedAction.basedOn,
          priority: selectedAction.priority,
        } : null}
        company={selectedAction?.companyName || ""}
        hasNextAction={hasNextAction()}
        onNextAction={handleNextAction}
        onArchive={handleDialogArchive}
        onMarkDone={handleMarkDone}
      />

      <ActionMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        action={selectedAction ? {
          id: selectedAction.id,
          stakeholderIds: selectedAction.stakeholders.map(s => s.id),
          stakeholderName: selectedAction.stakeholders[0]?.name || "",
          stakeholderRole: selectedAction.stakeholders[0]?.role || "",
          artifact: selectedAction.artifact,
          basedOn: selectedAction.basedOn,
          priority: selectedAction.priority,
        } : null}
        company={selectedAction?.companyName || ""}
        hasNextAction={hasNextAction()}
        onNextAction={handleNextAction}
        onArchive={handleDialogArchive}
        onMarkDone={handleMarkDone}
      />

      <ArchiveConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
        actionTitle={actionToArchive?.title || ""}
      />
    </div>
  );
};

// List Item Component
interface ActionListItemProps {
  action: DisplayAction;
  isExpanded: boolean;
  isGenerated?: boolean;
  onToggleExpand: () => void;
  onGoToAction: (action: DisplayAction) => void;
  onArchive: (action: DisplayAction) => void;
}

const ActionListItem = ({ action, isExpanded, isGenerated, onToggleExpand, onGoToAction, onArchive }: ActionListItemProps) => {
  const ActionIcon = action.type === "email" ? Mail : Video;
  
  // Get border color based on priority
  const getBorderColor = () => {
    if (action.priority === "high") return "hsl(var(--red))";
    if (action.priority === "medium") return "hsl(var(--yellow))";
    return "hsl(var(--muted-foreground) / 0.3)";
  };
  
  // Format deadline with color coding
  const getDeadlineStyle = (deadline: string) => {
    if (deadline === "Today") return "text-red font-semibold";
    if (deadline === "Tomorrow") return "text-yellow font-semibold";
    return "text-muted-foreground";
  };
  
  // Get background tint based on priority
  const getPriorityBg = () => {
    if (action.priority === "high") return "bg-red/[0.06]";
    if (action.priority === "medium") return "bg-yellow/[0.08]";
    return "bg-muted/[0.03]";
  };
  
  return (
    <div 
      className={`group p-4 border-l-4 interactive-card-subtle ${isExpanded ? 'bg-muted/30' : getPriorityBg()}`}
      onClick={onToggleExpand}
      style={{ borderLeftColor: getBorderColor() }}
    >
      <div className="flex items-center gap-3">
        {/* Chevron Toggle */}
        <button 
          className="p-1 hover:bg-muted rounded transition-colors"
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
        >
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center shrink-0 relative">
          <ActionIcon className="w-5 h-5 text-purple" />
          {isGenerated && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-purple to-violet-500 flex items-center justify-center animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title as first line with company in brackets */}
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-foreground truncate">
              {action.title}
              <span className="text-sm text-muted-foreground font-normal ml-1.5">({action.companyName})</span>
            </p>
          </div>
          {/* Second line: stakeholder avatars + deal info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {/* Stakeholder avatars only */}
            <div className="flex items-center gap-1">
              <Avatar className="w-5 h-5">
                <AvatarImage src={action.stakeholders[0]?.avatar} />
                <AvatarFallback className={`text-xxs ${getAvatarColor(action.stakeholders[0]?.id || 0)}`}>
                  {action.stakeholders[0]?.name?.split(" ").map(n => n[0]).join("") || "?"}
                </AvatarFallback>
              </Avatar>
              {action.stakeholders.length > 1 && (
                <span className="text-xxs text-muted-foreground">+{action.stakeholders.length - 1}</span>
              )}
            </div>
            {/* Deal info */}
            <span className="text-sm text-muted-foreground">{action.dealName}</span>
          </div>
        </div>

        {/* Deadline Column */}
        <div className="flex items-center shrink-0">
          <span className={`text-sm ${getDeadlineStyle(action.deadline)}`}>{action.deadline}</span>
        </div>


        {/* Actions - always visible */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => { e.stopPropagation(); onArchive(action); }}
          >
            <Archive className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-purple text-purple bg-white group-hover:bg-purple/10 group-hover:border-purple hover:!bg-gradient-to-r hover:!from-purple hover:!to-orange-500 hover:!text-white hover:!border-transparent transition-all duration-200"
            onClick={(e) => { e.stopPropagation(); onGoToAction(action); }}
          >
            Go
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Expanded Content Component - matches DealExpandedRow design
interface ActionExpandedContentProps {
  action: DisplayAction;
  onGoToAction: () => void;
  onArchive: () => void;
}

const ActionExpandedContent = ({ action, onGoToAction, onArchive }: ActionExpandedContentProps) => {
  const reasoning = getAIReasoning(action);
  const attachments = getActionAttachments(action);
  
  // Get full stakeholder data
  const allStakeholders = action.stakeholders.map(s => getStakeholderById(s.id)).filter(Boolean);

  return (
    <div className="bg-muted/30 p-6 space-y-6 animate-fade-in">
      {/* Summary */}
      <SummaryBox>
        {reasoning}
      </SummaryBox>

      {/* Artifact & Attachments Row */}
      <div className="flex flex-wrap gap-6">
        {/* Artifact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground">Artifact</h4>
          </div>
          <div className="pl-6">
            <p className="text-sm font-medium text-foreground">{action.artifact}</p>
            <p className="text-sm text-muted-foreground mt-1">Based on: {action.basedOn}</p>
          </div>
        </div>

        {/* Attachments */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground">Attachments</h4>
          </div>
          <div className="flex gap-2 pl-6">
            {attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded text-xs">
                {att.type === "pdf" ? (
                  <FileText className="w-3 h-3 text-red" />
                ) : (
                  <File className="w-3 h-3 text-blue-500" />
                )}
                <span className="text-foreground">{att.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stakeholders - using cards like DealExpandedRow */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h4 className="font-semibold text-foreground">Stakeholders</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allStakeholders.map((sh) => sh && (
            <ActionStakeholderCard key={sh.id} stakeholder={sh} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Simplified Stakeholder Card for Action Expanded - only Priority, Sentiment, Engagement
interface ActionStakeholderCardProps {
  stakeholder: NonNullable<ReturnType<typeof getStakeholderById>>;
}

const ActionStakeholderCard = ({ stakeholder }: ActionStakeholderCardProps) => {
  const { openPopup } = useStakeholderPopup();
  
  const getLocalStatusColor = (status: "positive" | "neutral" | "negative") => {
    switch (status) {
      case "positive": return "bg-green/10 text-green border-green/20";
      case "neutral": return "bg-yellow/10 text-yellow border-yellow/20";
      case "negative": return "bg-red/10 text-red border-red/20";
    }
  };

  return (
    <div
      onClick={() => openPopup(stakeholder)}
      className="group relative bg-card border border-border rounded-lg p-4 space-y-3 cursor-pointer
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-purple/10 hover:border-purple/40 hover:-translate-y-0.5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-9 h-9 transition-all duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-purple/30">
          <AvatarImage src={stakeholder.avatar} />
          <AvatarFallback className={`${getAvatarColor(stakeholder.id)} text-xs font-medium`}>
            {stakeholder.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate transition-colors duration-200 group-hover:text-purple">
            {stakeholder.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{stakeholder.role}</p>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getLocalStatusColor(stakeholder.status)}`}>
          {stakeholder.status}
        </span>
      </div>

      {/* Progress Bars - Only Priority, Sentiment, Engagement */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Priority</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getProgressColor(stakeholder.priority)}`}
              style={{ width: `${stakeholder.priority}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{stakeholder.priority}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Sentiment</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getProgressColor(stakeholder.sentiment)}`}
              style={{ width: `${stakeholder.sentiment}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{stakeholder.sentiment}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-20">Engagement</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${getProgressColor(stakeholder.engagement)}`}
              style={{ width: `${stakeholder.engagement}%` }}
            />
          </div>
          <span className="text-xs font-medium w-8 text-right">{stakeholder.engagement}%</span>
        </div>
      </div>

      {/* Focus Area Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {getPrimitivesForRole(stakeholder.role).slice(0, 3).map((p) => {
          const primitive = getPrimitiveById(p.primitiveId);
          if (!primitive) return null;
          const pillStyles = p.weight > 70 
            ? 'bg-purple text-white' 
            : p.weight >= 40 
              ? 'bg-purple/20 text-foreground' 
              : 'bg-muted text-muted-foreground';
          return (
            <span key={p.primitiveId} className={`px-2 py-0.5 rounded-full text-xs font-medium ${pillStyles}`}>
              {primitive.shortLabel}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default ActionsView;
