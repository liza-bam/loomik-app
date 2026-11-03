import { useState, useEffect, useMemo } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/dashboard/Header";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ChevronLeft, ChevronRight, Mail, Video, Calendar, CheckCircle2, Archive, Search, AlertTriangle, Bell, Clock, Users, MessageSquare, Phone, FileText, ArrowRight, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useActionsStore, Action } from "@/stores/actionsStore";
import { useSignalsStore, DetectedSignal } from "@/stores/signalsStore";
import { deals, getStakeholdersForDeal, getCompanyById } from "@/data/dealData";
import { toast } from "@/hooks/use-toast";
import { avatarFallback, categoryBadge, priorityDot, selectedChip, unselectedChip } from "@/lib/tone";

const tabTrigger = "gap-1.5 data-[state=active]:bg-primary-subtle data-[state=active]:text-primary data-[state=active]:shadow-none";
const segment = (active: boolean) => `px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${active ? selectedChip : unselectedChip}`;

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
      <div className="flex border-b border-border bg-card">
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
          <div className="p-6 pt-6">
            <Card className="p-0 overflow-hidden">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "actions" | "signals" | "timeline")}>
                {/* Header - wraps on smaller screens */}
                <div className="p-4 border-b border-border space-y-3">
                  {/* Row 1: Tabs */}
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <TabsList className="bg-muted/50">
                      <TabsTrigger value="actions" className={tabTrigger}>
                        <Archive className="w-3.5 h-3.5 hidden sm:block" />
                        Actions
                      </TabsTrigger>
                      <TabsTrigger value="signals" className={tabTrigger}>
                        <Bell className="w-3.5 h-3.5 hidden sm:block" />
                        Signals & Risks
                      </TabsTrigger>
                      <TabsTrigger value="timeline" className={tabTrigger}>
                        <Clock className="w-3.5 h-3.5 hidden sm:block" />
                        Timeline
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={activeTab === "timeline" ? "Search timeline..." : "Search history..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-44 bg-muted border-0 text-xs h-8"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Sub-filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {activeTab === "actions" ? (
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                          onClick={() => setActionFilter("all")}
                          className={segment(actionFilter === "all")}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setActionFilter("done")}
                          className={segment(actionFilter === "done")}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Done ({doneActions.length})
                        </button>
                        <button
                          onClick={() => setActionFilter("archived")}
                          className={segment(actionFilter === "archived")}
                        >
                          <Archive className="w-3 h-3" />
                          Archived ({archivedActions.length})
                        </button>
                      </div>
                    ) : activeTab === "signals" ? (
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <button
                          onClick={() => setSignalFilter("all")}
                          className={segment(signalFilter === "all")}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setSignalFilter("processed")}
                          className={segment(signalFilter === "processed")}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Processed
                        </button>
                        <button
                          onClick={() => setSignalFilter("ignored")}
                          className={segment(signalFilter === "ignored")}
                        >
                          <Archive className="w-3 h-3" />
                          Ignored
                        </button>
                      </div>
                    ) : (
                      <Select value={timelineParticipant} onValueChange={setTimelineParticipant}>
                        <SelectTrigger className="w-40 h-8 text-xs">
                          <SelectValue placeholder="All Participants" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Participants</SelectItem>
                          {allParticipants.slice(0, 10).map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
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
                  {/* Timeline Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Stakeholder Engagement Timeline</h3>
                      <p className="text-sm text-muted-foreground">Comprehensive tracking of all stakeholder interactions and engagement patterns</p>
                    </div>
                  </div>
                  
                  {/* Events count */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm text-foreground">{filteredTimeline.length} Events</span>
                    <span className="text-xs text-muted-foreground">All timeline events</span>
                    <Badge variant="outline" className="ml-auto text-xs">{filteredTimeline.length} Total</Badge>
                  </div>

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

// History Action Item Component
const HistoryActionItem = ({ action, onUnarchive }: { action: Action; onUnarchive?: (actionId: number) => void }) => {
  const ActionIcon = action.type === "email" ? Mail : Video;
  const StatusIcon = action.status === "done" ? CheckCircle2 : Archive;
  const statusColor = action.status === "done" ? "bg-success-subtle text-success" : "bg-muted text-muted-foreground";
  const statusLabel = action.status === "done" ? "Done" : "Archived";

  return (
    <div className="group bg-card border border-border rounded-lg p-4 flex items-center gap-3 interactive-card-subtle">
      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <ActionIcon className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="min-w-0 w-40 shrink-0">
        <p className="font-medium text-foreground text-sm truncate">{action.title}</p>
        <p className="text-xs text-muted-foreground truncate">{action.artifact}</p>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Avatar className="w-5 h-5 shrink-0">
          <AvatarImage src={action.companyLogo} alt={action.companyName} className="object-contain p-0.5" />
          <AvatarFallback className="bg-muted text-foreground text-xxs">
            {action.companyName.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="text-xs min-w-0 truncate">
          <span className="font-medium text-foreground">{action.companyName}</span>
          <span className="text-muted-foreground"> · {action.dealName}</span>
        </div>
      </div>

      <div className="flex items-center -space-x-1.5 shrink-0">
        {action.stakeholders.slice(0, 2).map((sh) => (
          <Avatar key={sh.id} className="w-5 h-5 border-2 border-card">
            <AvatarImage src={sh.avatar} />
            <AvatarFallback className={`${avatarFallback} text-xxs`}>
              {sh.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Calendar className="w-3 h-3" />
        <span>
          {action.completedAt
            ? new Date(action.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "—"}
        </span>
      </div>

      <Badge variant="outline" className={`${statusColor} border-0 gap-1 shrink-0 text-xs`}>
        <StatusIcon className="w-3 h-3" />
        {statusLabel}
      </Badge>

      {/* Unarchive button - only for archived actions */}
      {action.status === "archived" && onUnarchive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnarchive(action.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground gap-1 shrink-0 h-7 px-2"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="text-xs">Restore</span>
        </Button>
      )}
    </div>
  );
};

// History Signal/Risk Item Component
const HistorySignalRiskItem = ({ item, onUnignore }: { item: DetectedSignal; onUnignore?: (signalId: string) => void }) => {
  const TypeIcon = item.type === "signal" ? Bell : AlertTriangle;
  const StatusIcon = item.status === "processed" ? CheckCircle2 : Archive;
  const typeColor = item.type === "signal" ? "bg-muted text-muted-foreground" : "bg-danger-subtle text-danger";
  const statusColor = item.status === "processed" ? "bg-success-subtle text-success" : "bg-muted text-muted-foreground";

  const stakeholderName = item.stakeholder?.name || 'Unknown';

  return (
    <div className="group bg-card border border-border rounded-lg p-4 flex items-center gap-4 interactive-card-subtle">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor}`}>
        <TypeIcon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.trigger}</p>
        <p className="text-sm text-muted-foreground truncate">{item.name} · {item.dealName} · {stakeholderName}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
        <Calendar className="w-3 h-3" />
        <span>{formatTimeAgo(item.processedAt || item.detectedAt)}</span>
      </div>

      <Badge variant="outline" className={`${statusColor} border-0 gap-1`}>
        <StatusIcon className="w-3 h-3" />
        {item.status === "processed" ? "Processed" : "Ignored"}
      </Badge>

      {/* Restore button - only for ignored signals/risks */}
      {item.status === "ignored" && onUnignore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUnignore(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-xs">Restore</span>
        </Button>
      )}
    </div>
  );
};

// Timeline Event Card Component
const TimelineEventCard = ({ event }: { event: TimelineEvent }) => {
  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case "call": return Phone;
      case "email": return Mail;
      case "meeting": return MessageSquare;
      case "proposal": return FileText;
      case "demo": return MessageSquare;
      default: return MessageSquare;
    }
  };
  
  const getSentimentBadge = (sentiment: "positive" | "neutral" | "pending") => {
    switch (sentiment) {
      case "positive": return { bg: "bg-success-subtle text-success", label: "✓ Positive" };
      case "neutral": return { bg: categoryBadge, label: "◎ Neutral" };
      case "pending": return { bg: categoryBadge, label: "⏳ Pending" };
    }
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return { bg: categoryBadge, label: "⚡ High" };
      case "medium": return { bg: categoryBadge, label: "↗ Medium" };
      case "low": return { bg: categoryBadge, label: "→ Low" };
    }
  };

  const EventIcon = getEventIcon(event.type);
  const sentimentBadge = getSentimentBadge(event.sentiment);
  const priorityBadge = getPriorityBadge(event.priority);

  return (
    <div className="p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-muted text-muted-foreground">
          <EventIcon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <h4 className="font-semibold text-foreground">{event.title}</h4>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className={`text-xxs px-2 py-0 h-5 border-transparent ${sentimentBadge.bg}`}>
                {sentimentBadge.label}
              </Badge>
              <Badge variant="outline" className={`text-xxs px-2 py-0 h-5 gap-1 border-transparent ${priorityBadge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(event.priority)}`} />
                {priorityBadge.label}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} at {event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{event.stakeholders.join(", ")}, {event.stakeholderTeam}</span>
            </div>
          </div>
          
          {event.nextAction && (
            <div className="bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">
                <span className="font-medium">Next Action:</span> {event.nextAction}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;