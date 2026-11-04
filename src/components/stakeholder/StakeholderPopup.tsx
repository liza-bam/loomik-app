import { useState } from "react";
import { Mail, Video, ListChecks, Target, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Disclosure } from "@/components/ui/disclosure";
import { getActionsForStakeholder, getDealById, getCompanyById, type Stakeholder, type Action } from "@/data/dealData";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";
import ActionEmailDialog from "@/components/dashboard/ActionEmailDialog";
import ActionMeetingDialog from "@/components/dashboard/ActionMeetingDialog";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";
import { useSignalsStore } from "@/stores/signalsStore";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { scoreText, sentimentBadge, priorityDot, avatarFallback, selectedChip, categoryBadge, chartTooltip, chartTick } from "@/lib/tone";

const SERIES = [
  { key: "priority", label: "Priority", color: "hsl(var(--chart-1))", swatch: "bg-chart-1" },
  { key: "sentiment", label: "Sentiment", color: "hsl(var(--chart-2))", swatch: "bg-chart-2" },
  { key: "engagement", label: "Engagement", color: "hsl(var(--chart-3))", swatch: "bg-chart-3" },
] as const;

// Mock trend: overlapping sine waves around the current scores, seeded by stakeholder id
// so each person gets a stable, distinct curve (same shape as the Deal GPS card).
const generateTrend = (s: Stakeholder) => {
  const seed = s.id * 137;
  const wave = (t: number, parts: [number, number, number, number][]) =>
    parts.reduce((sum, [freq, phase, off, amp]) => sum + Math.sin(t * Math.PI * freq + seed * phase + off) * amp, 0);
  const clamp = (v: number) => Math.round(Math.max(20, Math.min(95, v)));

  return Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    return {
      date: i === 11 ? "Now" : "",
      priority: clamp(s.priority + wave(t, [[4, 0.1, 0, 25], [2.5, 0.2, 1, 15], [6, 0.15, 0, 10]])),
      sentiment: clamp(s.sentiment + wave(t, [[3, 0.3, 2, 22], [5, 0.25, 0, 12], [2, 0.35, 0.5, 18]])),
      engagement: clamp(s.engagement + wave(t, [[3.5, 0.4, 1.5, 20], [4.5, 0.45, 0, 14], [2.8, 0.5, 2.5, 16]])),
    };
  });
};

export const StakeholderPopup = () => {
  const { isOpen, stakeholder, closePopup } = useStakeholderPopup();
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const { signals: allSignals } = useSignalsStore();

  if (!stakeholder) return null;

  const actions = getActionsForStakeholder(stakeholder.id);
  const nextAction = actions[0];
  const deal = getDealById(stakeholder.dealId);
  const company = deal ? getCompanyById(deal.companyId) : undefined;
  const pending = allSignals.filter((s) => s.stakeholder?.id === stakeholder.id && s.status === "pending");
  const primitives = getPrimitivesForRole(stakeholder.role).slice(0, 6);

  const openAction = (action: Action) => {
    setSelectedAction(action);
    if (action.type === "email") setEmailDialogOpen(true);
    else setMeetingDialogOpen(true);
  };

  const openDealGps = () => {
    closePopup();
    // The popup lives outside the router, so navigate with a full URL.
    window.location.href = `${import.meta.env.BASE_URL}deal-gps?stakeholder=${stakeholder.id}`;
  };

  const actionDialogProps = selectedAction && {
    id: selectedAction.id,
    stakeholderIds: selectedAction.stakeholderIds,
    stakeholderName: stakeholder.name,
    stakeholderRole: stakeholder.role,
    artifact: selectedAction.title,
    basedOn: selectedAction.basedOn,
    priority: selectedAction.priority,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePopup()}>
      <DialogContent className="max-w-lg max-h-popup flex flex-col gap-0 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        {/* Header: who */}
        <div className="shrink-0 flex items-center gap-3 p-4 sm:p-6 sm:pb-4 pr-12">
          <Avatar className="w-12 h-12 shrink-0">
            <AvatarImage src={stakeholder.avatar} />
            <AvatarFallback className={`${avatarFallback} font-medium`}>
              {stakeholder.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <DialogTitle className="truncate text-lg">{stakeholder.name}</DialogTitle>
              <Badge variant="outline" className={`shrink-0 border-transparent capitalize ${sentimentBadge(stakeholder.status)}`}>
                {stakeholder.status}
              </Badge>
            </div>
            <p className="truncate text-sm text-muted-foreground">
              {[stakeholder.role, company?.name].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-2 sm:px-6 space-y-4">
          {/* Key facts */}
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-border">
            {SERIES.map(({ key, label }) => (
              <div key={key} className="px-3 py-2 text-center">
                <p className={`text-lg font-semibold ${scoreText(stakeholder[key])}`}>{stakeholder[key]}%</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-foreground">{stakeholder.summary}</p>

          {stakeholder.lastInteraction && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Last contact {stakeholder.lastInteraction.date}:</span>{" "}
              {stakeholder.lastInteraction.summary}
            </p>
          )}

          {/* Everything else folded */}
          <div>
            <Disclosure title="Actions" icon={ListChecks} summary={actions.length || "None"}>
              {actions.length > 0 ? (
                <div className="space-y-2">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => openAction(action)}
                      className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(action.priority)}`} />
                        {action.type === "email" ? <Mail className="w-4 h-4 shrink-0 text-muted-foreground" /> : <Video className="w-4 h-4 shrink-0 text-muted-foreground" />}
                        <span className="truncate text-sm font-medium text-foreground">{action.title}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{action.basedOn}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No actions yet</p>
              )}
            </Disclosure>

            <Disclosure title="Primary focus" icon={Target} summary={primitives.length}>
              <div className="flex flex-wrap gap-1.5">
                {primitives.map((p) => {
                  const primitive = getPrimitiveById(p.primitiveId);
                  if (!primitive) return null;
                  return (
                    <span
                      key={p.primitiveId}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm ${p.weight > 70 ? selectedChip : categoryBadge}`}
                    >
                      {primitive.shortLabel}
                      <span className="text-xs font-medium">{p.weight}%</span>
                    </span>
                  );
                })}
              </div>
            </Disclosure>

            <Disclosure title="Trend" icon={TrendingUp}>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={generateTrend(stakeholder)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="date" tick={chartTick} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <RechartsTooltip contentStyle={chartTooltip} />
                    {SERIES.map(({ key, label, color }) => (
                      <Area key={key} type="natural" dataKey={key} name={label} stroke={color} strokeWidth={2} fill="none" dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-4">
                {SERIES.map(({ key, label, swatch }) => (
                  <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-4 h-1.5 rounded ${swatch}`} />
                    {label}
                  </span>
                ))}
              </div>
            </Disclosure>
          </div>
        </div>

        {/* Sticky footer: one primary action */}
        <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end sm:px-6">
          <Button variant="outline" className="w-full sm:w-auto" onClick={openDealGps}>
            Deal GPS{pending.length > 0 && ` · ${pending.length} alerts`}
          </Button>
          {nextAction && (
            <Button className="w-full sm:w-auto gap-1.5" onClick={() => openAction(nextAction)}>
              {nextAction.type === "email" ? <Mail className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              {nextAction.type === "email" ? "Draft email" : "Prep meeting"}
            </Button>
          )}
        </div>

        <ActionEmailDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          action={actionDialogProps}
          company={company?.name ?? ""}
          companyLogo={company?.logo}
        />
        <ActionMeetingDialog
          open={meetingDialogOpen}
          onOpenChange={setMeetingDialogOpen}
          action={actionDialogProps}
          company={company?.name ?? ""}
          companyLogo={company?.logo}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderPopup;
