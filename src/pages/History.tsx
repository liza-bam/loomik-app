import { useState, useEffect, useMemo, type ElementType } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/dashboard/Header";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ChevronLeft, ChevronRight, Mail, Video, Archive, Search, AlertTriangle, Bell, Clock, Users, MessageSquare, Phone, FileText, ArrowRight, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useActionsStore, Action } from "@/stores/actionsStore";
import { useSignalsStore, DetectedSignal } from "@/stores/signalsStore";
import { toast } from "@/hooks/use-toast";
import { categoryBadge, priorityDot, selectedChip, unselectedChip } from "@/lib/tone";

const tabTrigger = "data-[state=active]:bg-primary-subtle data-[state=active]:text-primary data-[state=active]:shadow-none";
const chip = (active: boolean) =>
  `h-8 px-3 shrink-0 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${active ? selectedChip : `border border-border ${unselectedChip}`}`;

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

// Import persistent timeline data
import { timelineEvents, getAllParticipants, TimelineEvent, TimelineEventType } from "@/data/historyData";
import Logo from "@/components/Logo";

const History = () => {
  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"actions" | "signals" | "timeline">(
    (searchParams.get("tab") as "actions" | "signals" | "timeline") || "actions"
  );
  const [actionFilter, setActionFilter] = useState<"all" | "done" | "archived">("all");
  const [signalFilter, setSignalFilter] = useState<"all" | "processed" | "ignored">("all");
  const [timelineParticipant, setTimelineParticipant] = useState<string>("all");
  
  const { getHistoryActions, archivedActions, doneActions, unarchiveAction } = useActionsStore();
  const { getProcessedSignals, getIgnoredSignals, unignoreSignal } = useSignalsStore();
  const historyActions = getHistoryActions();
  const processedSignals = getProcessedSignals();
  const ignoredSignals = getIgnoredSignals();
  const allHistorySignals = useMemo(() => [...processedSignals, ...ignoredSignals].sort(
    (a, b) => new Date(b.processedAt || b.detectedAt).getTime() - new Date(a.processedAt || a.detectedAt).getTime()
  ), [processedSignals, ignoredSignals]);

  // Handle unarchive with toast notification
  const handleUnarchive = (actionId: number) => {
    const action = archivedActions.find(a => a.id === actionId);
    unarchiveAction(actionId);
    toast({
      title: "Action restored",
      description: action ? `"${action.title}" has been moved back to the Action Hub.` : "Action has been restored.",
    });
  };

  // Handle unignore signal/risk with toast notification
  const handleUnignoreSignal = (signalId: string) => {
    const signal = ignoredSignals.find(s => s.id === signalId);
    unignoreSignal(signalId);
    toast({
      title: `${signal?.type === "risk" ? "Risk" : "Signal"} restored`,
      description: signal ? `"${signal.trigger.slice(0, 40)}..." has been moved back to pending.` : "Item has been restored.",
    });
  };

  // Get deal filter from URL if present
  const dealIdParam = searchParams.get("deal");
  const filteredDealId = dealIdParam ? parseInt(dealIdParam) : null;

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById("main-scroll");
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 60);
      }
    };

    const mainContent = document.getElementById("main-scroll");
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredActions = historyActions.filter(action => {
    if (actionFilter === "done" && action.status !== "done") return false;
    if (actionFilter === "archived" && action.status !== "archived") return false;
    if (searchQuery && !action.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredSignalsRisks = useMemo(() => {
    return allHistorySignals.filter(item => {
      if (signalFilter === "processed" && item.status !== "processed") return false;
      if (signalFilter === "ignored" && item.status !== "ignored") return false;
      if (searchQuery && !item.trigger.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allHistorySignals, signalFilter, searchQuery]);

  const filteredTimeline = timelineEvents.filter(event => {
    if (filteredDealId && event.dealId !== filteredDealId) return false;
    if (timelineParticipant !== "all" && !event.stakeholders.some(s => s.toLowerCase().includes(timelineParticipant.toLowerCase()))) return false;
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get unique participants for filter
  const allParticipants = getAllParticipants();

  return (
    <div className="h-screen flex flex-col bg-background bg-canvas bg-cover overflow-hidden">
      {/* Header - hides on scroll */}
      <div className={`transition-all duration-200 ${isScrolled ? "h-0 opacity-0 overflow-hidden" : ""}`}>
        <Header isScrolled={isScrolled} />
      </div>
      
      {/* Tab Navigation + AI Header - side by side */}
      <div className="flex border-b border-border bg-card max-lg:hidden">
        <div className="flex-1">
          <TabNavigation isScrolled={isScrolled} activeTab="History" />
        </div>
        
        {/* AI Header - collapsible toggle - ONLY tablet/desktop */}
        {!isMobile && (
          <div className={`flex items-center gap-2 px-2 md:px-4 border-l border-border transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-10 md:w-12"}`}>
            {isAIPanelOpen && (
              <>
                <Logo className="h-4 md:h-5" />
                <div className="w-2 h-2 bg-success rounded-full" />
              </>
            )}
            <button 
              onClick={toggleAIPanel}
              className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            >
              {isAIPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - scrollable, full width on mobile */}
        <main id="main-scroll" className="flex-1 overflow-y-auto pb-20">
          <div className="p-4 lg:p-6">
            <Card className="p-0 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "actions" | "signals" | "timeline")}>
                {/* Header: tabs + search, then one scrolling chip row */}
                <div className="p-4 border-b border-border space-y-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList className="grid grid-cols-3 bg-muted/50 sm:inline-flex">
                      <TabsTrigger value="actions" className={tabTrigger}>Actions</TabsTrigger>
                      <TabsTrigger value="signals" className={tabTrigger}>Signals</TabsTrigger>
                      <TabsTrigger value="timeline" className={tabTrigger}>Timeline</TabsTrigger>
                    </TabsList>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-56 bg-muted border-0 h-10 sm:h-9"
                      />
                    </div>
                  </div>

                  <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4">
                    {activeTab === "actions" &&
                      ([["all", "All"], ["done", `Done ${doneActions.length}`], ["archived", `Archived ${archivedActions.length}`]] as const).map(([value, label]) => (
                        <button key={value} onClick={() => setActionFilter(value)} className={chip(actionFilter === value)}>{label}</button>
                      ))}
                    {activeTab === "signals" &&
                      ([["all", "All"], ["processed", "Processed"], ["ignored", "Ignored"]] as const).map(([value, label]) => (
                        <button key={value} onClick={() => setSignalFilter(value)} className={chip(signalFilter === value)}>{label}</button>
                      ))}
                    {activeTab === "timeline" &&
                      ["all", ...allParticipants.slice(0, 10)].map((p) => (
                        <button key={p} onClick={() => setTimelineParticipant(p)} className={chip(timelineParticipant === p)}>
                          {p === "all" ? "Everyone" : p}
                        </button>
                      ))}
                    <span className="ml-auto shrink-0 pl-2 text-xs text-muted-foreground whitespace-nowrap">
                      {activeTab === "actions" ? filteredActions.length : activeTab === "signals" ? filteredSignalsRisks.length : filteredTimeline.length} items
                    </span>
                  </div>
                </div>

                {/* Actions Tab Content */}
                <TabsContent value="actions" className="m-0 p-4">
                  {filteredActions.length > 0 ? (
                    <div className="space-y-2">
                      {filteredActions.map((action) => (
                        <HistoryActionItem 
                          key={`${action.status}-${action.id}`} 
                          action={action} 
                          onUnarchive={handleUnarchive}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState type="actions" />
                  )}
                </TabsContent>

                {/* Signals & Risks Tab Content */}
                <TabsContent value="signals" className="m-0 p-4">
                  {filteredSignalsRisks.length > 0 ? (
                    <div className="space-y-2">
                      {filteredSignalsRisks.map((item) => (
                        <HistorySignalRiskItem 
                          key={`${item.type}-${item.id}`} 
                          item={item} 
                          onUnignore={handleUnignoreSignal}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState type="signals" />
                  )}
                </TabsContent>

                {/* Timeline Tab Content */}
                <TabsContent value="timeline" className="m-0">
                  {filteredTimeline.length > 0 ? (
                    <div className="divide-y divide-border">
                      {filteredTimeline.map((event) => (
                        <TimelineEventCard key={event.id} event={event} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState type="timeline" />
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>

        {/* AI Chat Sidebar - ONLY tablet/desktop */}
        {!isMobile && (
          <aside className={`border-l border-border bg-card flex flex-col overflow-hidden transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-0"}`}>
            {isAIPanelOpen && <AIChatPanel hideHeader />}
          </aside>
        )}
      </div>

      {/* Bottom Nav + AI Sheet - ONLY mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ type }: { type: "actions" | "signals" | "timeline" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      {type === "actions" ? <Archive className="w-8 h-8 text-muted-foreground" /> : 
       type === "signals" ? <Bell className="w-8 h-8 text-muted-foreground" /> :
       <Clock className="w-8 h-8 text-muted-foreground" />}
    </div>
    <h3 className="font-medium text-foreground mb-1">
      {type === "actions" ? "No action history yet" : 
       type === "signals" ? "No signals or risks history" :
       "No timeline events"}
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      {type === "actions" 
        ? "Actions that you complete or archive will appear here for future reference."
        : type === "signals"
        ? "Signals and risks that you process or ignore will appear here."
        : "Stakeholder interactions and engagement events will appear here."}
    </p>
  </div>
);

const shortDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** One history row: icon, title + one meta line, status, and a restore button where it applies. */
const HistoryRow = ({
  icon: Icon,
  title,
  meta,
  status,
  done,
  onRestore,
}: {
  icon: ElementType;
  title: string;
  meta: string;
  status: string;
  done: boolean;
  onRestore?: () => void;
}) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="line-clamp-2 text-sm font-medium text-foreground">{title}</p>
      <p className="truncate text-xs text-muted-foreground">{meta}</p>
    </div>
    {onRestore ? (
      <Button variant="ghost" size="sm" onClick={onRestore} className="h-9 shrink-0 gap-1.5 text-muted-foreground">
        <RotateCcw className="w-3.5 h-3.5" /> <span className="max-sm:sr-only">Restore</span>
      </Button>
    ) : (
      <Badge variant="outline" className={`shrink-0 border-transparent ${done ? "bg-success-subtle text-success" : categoryBadge}`}>
        {status}
      </Badge>
    )}
  </div>
);

const HistoryActionItem = ({ action, onUnarchive }: { action: Action; onUnarchive?: (actionId: number) => void }) => (
  <HistoryRow
    icon={action.type === "email" ? Mail : Video}
    title={action.title}
    meta={[action.companyName, action.dealName, action.completedAt && shortDate(action.completedAt)].filter(Boolean).join(" · ")}
    status={action.status === "done" ? "Done" : "Archived"}
    done={action.status === "done"}
    onRestore={action.status === "archived" && onUnarchive ? () => onUnarchive(action.id) : undefined}
  />
);

const HistorySignalRiskItem = ({ item, onUnignore }: { item: DetectedSignal; onUnignore?: (signalId: string) => void }) => (
  <HistoryRow
    icon={item.type === "signal" ? Bell : AlertTriangle}
    title={item.trigger}
    meta={[item.name, item.dealName, item.stakeholder?.name, formatTimeAgo(item.processedAt || item.detectedAt)].filter(Boolean).join(" · ")}
    status={item.status === "processed" ? "Processed" : "Ignored"}
    done={item.status === "processed"}
    onRestore={item.status === "ignored" && onUnignore ? () => onUnignore(item.id) : undefined}
  />
);

const TIMELINE_ICON: Record<TimelineEventType, ElementType> = {
  call: Phone,
  email: Mail,
  meeting: MessageSquare,
  proposal: FileText,
  demo: MessageSquare,
};

/** Timeline entry: title + meta first; who and the next action stay on one muted line each. */
const TimelineEventCard = ({ event }: { event: TimelineEvent }) => {
  const EventIcon = TIMELINE_ICON[event.type] ?? MessageSquare;
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
        <EventIcon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-medium text-foreground">{event.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(event.priority)}`} />
          <span className="truncate">
            {shortDate(event.date)} {event.time} · <span className="capitalize">{event.sentiment}</span>
          </span>
        </p>
        <p className="text-sm text-muted-foreground">{event.description}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="w-3 h-3 shrink-0" />
          <span className="truncate">{[...event.stakeholders, event.stakeholderTeam].join(", ")}</span>
        </p>
        {event.nextAction && (
          <p className="flex items-center gap-1.5 text-sm text-foreground">
            <ArrowRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            {event.nextAction}
          </p>
        )}
      </div>
    </div>
  );
};

export default History;