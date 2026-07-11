import { useState } from "react";
import { Mail, Video, AlertTriangle, Zap } from "lucide-react";
import SummaryBox from "@/components/ui/summary-box";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { avatarColors, getActionsForStakeholder, getDealById, getCompanyById, type Stakeholder, type Action } from "@/data/dealData";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";
import ActionEmailDialog from "@/components/dashboard/ActionEmailDialog";
import ActionMeetingDialog from "@/components/dashboard/ActionMeetingDialog";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { useSignalsStore } from "@/stores/signalsStore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import { ValuePrimitiveBadge } from "@/components/value-primitives/ValuePrimitiveBadge";
import { getPrimitiveById } from "@/lib/value-primitives/types";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

const getLocalStatusColor = (status: "positive" | "neutral" | "negative") => {
  switch (status) {
    case "positive":
      return "bg-green/10 text-green border-green/20";
    case "neutral":
      return "bg-yellow/10 text-yellow border-yellow/20";
    case "negative":
      return "bg-red/10 text-red border-red/20";
  }
};

export const StakeholderPopup = () => {
  const { isOpen, stakeholder, closePopup } = useStakeholderPopup();
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  
  const { signals: allSignals } = useSignalsStore();

  if (!stakeholder) return null;

  // Get actions for this stakeholder
  const actions = getActionsForStakeholder(stakeholder.id);
  const deal = getDealById(stakeholder.dealId);
  const visibleActions = showAllActions ? actions : actions.slice(0, 3);
  const hasMoreActions = actions.length > 3;
  
  // Get signals/risks for this stakeholder
  const stakeholderSignals = allSignals.filter(s => 
    s.stakeholder?.id === stakeholder.id && s.status === 'pending'
  );
  const risksCount = stakeholderSignals.filter(s => s.type === 'risk').length;
  const signalsCount = stakeholderSignals.filter(s => s.type === 'signal').length;

  const handleActionClick = (action: Action) => {
    setSelectedAction(action);
    if (action.type === "email") {
      setEmailDialogOpen(true);
    } else {
      setMeetingDialogOpen(true);
    }
  };

  const getActionDialogProps = () => {
    if (!selectedAction) return null;
    return {
      id: selectedAction.id,
      stakeholderIds: selectedAction.stakeholderIds,
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role,
      artifact: selectedAction.title,
      basedOn: selectedAction.basedOn,
      priority: selectedAction.priority,
    };
  };

  // Generate truly wavy trend data with significant variation - SAME as DealGPS card
  const generateWavyTrends = () => {
    const numPoints = 12;
    const wavyData: { date: string; priority: number; sentiment: number; engagement: number }[] = [];
    
    // Use stakeholder's current values as anchors
    const basePriority = stakeholder.priority;
    const baseSentiment = stakeholder.sentiment;
    const baseEngagement = stakeholder.engagement;
    
    // Seed based on stakeholder ID for consistent but unique patterns
    const seed = stakeholder.id * 137;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      
      // Multiple overlapping sine waves with different frequencies create organic waves
      const wave1 = Math.sin(t * Math.PI * 4 + seed * 0.1) * 25;
      const wave2 = Math.sin(t * Math.PI * 2.5 + seed * 0.2 + 1) * 15;
      const wave3 = Math.sin(t * Math.PI * 6 + seed * 0.15) * 10;
      
      const wave4 = Math.sin(t * Math.PI * 3 + seed * 0.3 + 2) * 22;
      const wave5 = Math.sin(t * Math.PI * 5 + seed * 0.25) * 12;
      const wave6 = Math.sin(t * Math.PI * 2 + seed * 0.35 + 0.5) * 18;
      
      const wave7 = Math.sin(t * Math.PI * 3.5 + seed * 0.4 + 1.5) * 20;
      const wave8 = Math.sin(t * Math.PI * 4.5 + seed * 0.45) * 14;
      const wave9 = Math.sin(t * Math.PI * 2.8 + seed * 0.5 + 2.5) * 16;
      
      // Combine waves and clamp to valid range
      const priorityVal = Math.round(Math.max(20, Math.min(95, basePriority + wave1 + wave2 + wave3)));
      const sentimentVal = Math.round(Math.max(20, Math.min(95, baseSentiment + wave4 + wave5 + wave6)));
      const engagementVal = Math.round(Math.max(20, Math.min(95, baseEngagement + wave7 + wave8 + wave9)));
      
      wavyData.push({
        date: i === numPoints - 1 ? 'Now' : '',
        priority: priorityVal,
        sentiment: sentimentVal,
        engagement: engagementVal,
      });
    }
    
    return wavyData;
  };
  
  const trendsData = generateWavyTrends();

  // Get primitives with weights for display
  const primitivesWithWeights = getPrimitivesForRole(stakeholder.role);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePopup()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="p-5 pb-0 pr-14">
          <DialogTitle className="sr-only">Stakeholder Details</DialogTitle>
        </DialogHeader>
        
        <div className="p-5 pt-3 space-y-4">
          {/* Header: Avatar + Name/Role/LastInteraction + Risks/Signals */}
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-purple/20 shrink-0">
              <AvatarImage src={stakeholder.avatar} />
              <AvatarFallback className={`${getAvatarColor(stakeholder.id)} text-sm font-medium`}>
                {stakeholder.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">{stakeholder.name}</h2>
                <span className="text-sm text-muted-foreground whitespace-nowrap">· {stakeholder.role}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${getLocalStatusColor(stakeholder.status)}`}>
                  {stakeholder.status}
                </span>
              </div>
              {stakeholder.lastInteraction && (
                <p className="text-base text-foreground/80 mt-0.5">
                  Last interaction: {stakeholder.lastInteraction.date} — {stakeholder.lastInteraction.summary.replace(/via email/gi, 'via ')}
                  {stakeholder.lastInteraction.summary.toLowerCase().includes('email') && (
                    <button 
                      onClick={() => {
                        setSelectedAction(actions.find(a => a.type === 'email') || null);
                        if (actions.find(a => a.type === 'email')) setEmailDialogOpen(true);
                      }}
                      className="text-purple hover:underline font-medium"
                    >
                      email
                    </button>
                  )}
                </p>
              )}
            </div>
            {/* Risks/Signals in Header */}
            {(risksCount > 0 || signalsCount > 0) && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-orange/30 text-orange hover:bg-orange/10 shrink-0"
                onClick={() => {
                  closePopup();
                  window.location.href = `/deal-gps?stakeholder=${stakeholder.id}`;
                }}
              >
                {risksCount > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {risksCount}
                  </span>
                )}
                {risksCount > 0 && signalsCount > 0 && <span className="text-muted-foreground">/</span>}
                {signalsCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {signalsCount}
                  </span>
                )}
              </Button>
            )}
          </div>

          {/* Summary */}
          <SummaryBox className="text-sm py-3 px-4">
            {stakeholder.summary}
          </SummaryBox>

          {/* Main Content: Left (Scores + Focus + Chart) + Right (Actions) */}
          <div className="flex gap-5">
            {/* Left Column: Scores + Primary Focus + Trend Chart */}
            <div className="flex-1 space-y-4">
              {/* Scores as Pills */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Scores</p>
                <div className="flex flex-wrap gap-2">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${stakeholder.priority > 70 ? 'bg-green/10 border-green/30' : stakeholder.priority >= 50 ? 'bg-yellow/10 border-yellow/30' : 'bg-red/10 border-red/30'}`}>
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <span className={`text-sm font-semibold ${stakeholder.priority > 70 ? 'text-green' : stakeholder.priority >= 50 ? 'text-yellow' : 'text-red'}`}>{stakeholder.priority}%</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${stakeholder.sentiment > 70 ? 'bg-green/10 border-green/30' : stakeholder.sentiment >= 50 ? 'bg-yellow/10 border-yellow/30' : 'bg-red/10 border-red/30'}`}>
                    <span className="text-sm text-muted-foreground">Sentiment</span>
                    <span className={`text-sm font-semibold ${stakeholder.sentiment > 70 ? 'text-green' : stakeholder.sentiment >= 50 ? 'text-yellow' : 'text-red'}`}>{stakeholder.sentiment}%</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${stakeholder.engagement > 70 ? 'bg-green/10 border-green/30' : stakeholder.engagement >= 50 ? 'bg-yellow/10 border-yellow/30' : 'bg-red/10 border-red/30'}`}>
                    <span className="text-sm text-muted-foreground">Engagement</span>
                    <span className={`text-sm font-semibold ${stakeholder.engagement > 70 ? 'text-green' : stakeholder.engagement >= 50 ? 'text-yellow' : 'text-red'}`}>{stakeholder.engagement}%</span>
                  </div>
                </div>
              </div>

              {/* Primary Focus as Pills */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Primary Focus</p>
                <div className="flex flex-wrap gap-1.5">
                  {primitivesWithWeights.slice(0, 6).map((p) => {
                    const primitive = getPrimitiveById(p.primitiveId);
                    if (!primitive) return null;
                    const pillStyles = p.weight > 70 
                      ? 'bg-purple text-white' 
                      : p.weight >= 40 
                        ? 'bg-purple/20 text-foreground' 
                        : 'bg-muted text-muted-foreground';
                    return (
                      <div 
                        key={p.primitiveId}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${pillStyles}`}
                      >
                        <span>{primitive.shortLabel}</span>
                        <span className="text-xs font-medium">{p.weight}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trend Chart */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Trend History</p>
                <div className="h-28 bg-muted/10 rounded-lg p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendsData}>
                      <defs>
                        <linearGradient id="gradPopupPriority" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--yellow))" stopOpacity={0.5}/>
                          <stop offset="50%" stopColor="hsl(var(--yellow))" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="hsl(var(--yellow))" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="gradPopupSentiment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.45}/>
                          <stop offset="50%" stopColor="#ec4899" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="gradPopupEngagement" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--purple))" stopOpacity={0.5}/>
                          <stop offset="50%" stopColor="hsl(var(--purple))" stopOpacity={0.25}/>
                          <stop offset="100%" stopColor="hsl(var(--purple))" stopOpacity={0.05}/>
                        </linearGradient>
                        <filter id="popupGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="1.5" result="blur"/>
                          <feMerge>
                            <feMergeNode in="blur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                      <YAxis hide domain={[0, 100]} />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                          padding: '8px 12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }} 
                      />
                      <Area type="natural" dataKey="priority" name="Priority" stroke="hsl(var(--yellow))" strokeWidth={2} fill="url(#gradPopupPriority)" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--yellow))', stroke: 'white', strokeWidth: 2 }} filter="url(#popupGlow)" />
                      <Area type="natural" dataKey="sentiment" name="Sentiment" stroke="#ec4899" strokeWidth={1.5} fill="url(#gradPopupSentiment)" dot={false} activeDot={{ r: 5, fill: '#ec4899', stroke: 'white', strokeWidth: 2 }} />
                      <Area type="natural" dataKey="engagement" name="Engagement" stroke="hsl(var(--purple))" strokeWidth={1.5} fill="url(#gradPopupEngagement)" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--purple))', stroke: 'white', strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 bg-yellow rounded" />
                    <span className="text-xs text-muted-foreground">Priority</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 bg-pink-500 rounded" />
                    <span className="text-xs text-muted-foreground">Sentiment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-1.5 bg-purple rounded" />
                    <span className="text-xs text-muted-foreground">Engagement</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Actions - spans full height */}
            <div className="w-64 shrink-0 border-l border-border pl-5 flex flex-col">
              <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Actions ({actions.length})</p>
              {actions.length > 0 ? (
                <div className="space-y-2 flex-1">
                  {visibleActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-colors hover:bg-muted/50 ${
                        action.priority === 'high' ? 'border-l-[3px] border-l-red border-t-border border-r-border border-b-border' :
                        action.priority === 'medium' ? 'border-l-[3px] border-l-yellow border-t-border border-r-border border-b-border' :
                        'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {action.type === 'email' ? <Mail className="w-4 h-4 text-purple" /> : <Video className="w-4 h-4 text-green" />}
                        <span className="text-sm font-medium text-foreground truncate">{action.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{action.basedOn}</p>
                    </button>
                  ))}
                  {hasMoreActions && !showAllActions && (
                    <button
                      onClick={() => setShowAllActions(true)}
                      className="w-full text-sm text-purple hover:underline py-1"
                    >
                      +{actions.length - 3} more
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground flex-1">No actions yet</p>
              )}
            </div>
          </div>

        </div>

        {/* Action Dialogs */}
        <ActionEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          action={getActionDialogProps()}
          company={deal ? getCompanyById(deal.companyId)?.name || "" : ""}
          companyLogo={deal ? getCompanyById(deal.companyId)?.logo : undefined}
        />
        <ActionMeetingDialog
          open={meetingDialogOpen}
          onOpenChange={setMeetingDialogOpen}
          action={getActionDialogProps()}
          company={deal ? getCompanyById(deal.companyId)?.name || "" : ""}
          companyLogo={deal ? getCompanyById(deal.companyId)?.logo : undefined}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderPopup;
