import { useState, useMemo, useEffect, useRef } from "react";
import { AlertTriangle, ArrowRight, Bell, Check, FileText, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Disclosure } from "@/components/ui/disclosure";
import { cn } from "@/lib/utils";
import { avatarFallback, priorityDot, selectedChip, sentimentDot, unselectedChip } from "@/lib/tone";
import { useNavigate } from "react-router-dom";
import { useSignalsStore, DetectedSignal } from "@/stores/signalsStore";
import { useGeneratedActionsStore } from "@/stores/generatedActionsStore";
import { useSignalProcessor } from "@/hooks/useSignalProcessor";
import { getStakeholderById } from "@/data/dealData";
import { toast } from "@/hooks/use-toast";
import { CRITICAL_EVENT_LABELS } from "@/data/signalsData";

type Tab = "risks" | "signals";
type EditableKey = "evidence" | "suggestedAction";

const chip = (active: boolean) =>
  cn(
    "h-8 px-3 shrink-0 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
    active ? selectedChip : cn("border border-border", unselectedChip),
  );

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const formatTimeAgo = (date: Date) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 60 / 24)}d ago`;
};

// Critical first, then urgent, then priority, then newest.
const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
const byImportance = (a: DetectedSignal, b: DetectedSignal) =>
  Number(b.severity === "critical") - Number(a.severity === "critical") ||
  Number(b.isUrgent) - Number(a.isUrgent) ||
  priorityRank[a.priority] - priorityRank[b.priority] ||
  new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();

/** A text field with an always-visible edit button (hover-only buttons don't work on touch). */
const EditableField = ({ item, field, label }: { item: DetectedSignal; field: EditableKey; label: string }) => {
  const updateSignal = useSignalsStore((s) => s.updateSignal);
  const [draft, setDraft] = useState<string | null>(null);
  const value = item[field] ?? "";

  const save = () => {
    updateSignal(item.id, { [field]: draft ?? "" });
    toast({ title: `${label} updated` });
    setDraft(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {draft === null && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDraft(value)} aria-label={`Edit ${label}`}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      {draft === null ? (
        <p className="text-sm text-foreground">{value}</p>
      ) : (
        <div className="space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="text-sm min-h-20 resize-none" autoFocus />
          <div className="flex gap-2">
            <Button size="sm" onClick={save}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface SignalItemProps {
  item: DetectedSignal;
  onConfirm: () => void;
  onIgnore: () => void;
}

/** One risk or signal: title, severity, one-line summary and the primary action. Details are folded. */
const SignalItem = ({ item, onConfirm, onIgnore }: SignalItemProps) => {
  const isRisk = item.type === "risk";
  const isCritical = item.severity === "critical";
  const sentiment = item.sentiment ?? "neutral";
  const stakeholder = item.stakeholder;

  const severity = isRisk ? `${capitalize(item.priority)} priority` : capitalize(sentiment);
  const dot = isRisk ? priorityDot(item.priority) : sentimentDot(sentiment);

  return (
    <div className="rounded-lg border border-border bg-card px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarImage src={stakeholder?.avatar} />
          <AvatarFallback className={`${avatarFallback} text-xs`}>{initials(stakeholder?.name ?? "?")}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className="flex-1 font-medium text-foreground line-clamp-2">{item.name}</p>
            {isCritical && (
              <Badge
                variant="outline"
                className={cn("shrink-0 border-transparent text-xxs", isRisk ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success")}
              >
                {(item.eventCategory && CRITICAL_EVENT_LABELS[item.eventCategory]) || "Critical"}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {!isCritical && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />}
            <span className="truncate">
              {[isCritical ? "Critical" : severity, item.isUrgent && "Urgent", formatTimeAgo(item.detectedAt), item.dealName]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </p>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.trigger}</p>

      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={onConfirm}>
          <Check className="w-3.5 h-3.5" /> Confirm
        </Button>
        <Button size="sm" variant="ghost" className="h-9 text-muted-foreground" onClick={onIgnore}>
          {isCritical ? "Dismiss" : "Ignore"}
        </Button>
      </div>

      <Disclosure title="Details" icon={FileText} summary={`${item.confidence}% confidence`} className="mt-1 border-t">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {[stakeholder && `${stakeholder.name}, ${stakeholder.role}`, `via ${item.channel}`, `${item.confidence}% confidence`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {isCritical && (
            <p className={cn("text-sm font-medium", isRisk ? "text-danger" : "text-success")}>
              {isRisk
                ? "May cost 10–15% win probability if unaddressed."
                : "Can add 10–15% win probability."}
            </p>
          )}
          <EditableField item={item} field="evidence" label="Evidence" />
          {item.suggestedAction && <EditableField item={item} field="suggestedAction" label="Suggested action" />}
        </div>
      </Disclosure>
    </div>
  );
};

interface RisksSignalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: Tab;
}

const RisksSignalsDialog = ({ open, onOpenChange, defaultTab = "risks" }: RisksSignalsDialogProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const [dealFilter, setDealFilter] = useState("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showIgnoreAllConfirm, setShowIgnoreAllConfirm] = useState(false);
  const undoTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { getPendingRisks, getPendingSignals, ignoreSignal, unignoreSignal, ignoreAllSignals } = useSignalsStore();
  const { lastProcessingResult, clearLastResult } = useGeneratedActionsStore();
  const { processSignalWithActions, processAllWithActions } = useSignalProcessor();

  const liveRisks = getPendingRisks();
  const liveSignals = getPendingSignals();
  const tabItems = activeTab === "risks" ? liveRisks : liveSignals;
  const type = activeTab === "risks" ? "risk" : "signal";
  const Label = activeTab === "risks" ? "Risk" : "Signal";

  useEffect(() => setActiveTab(defaultTab), [defaultTab]);
  useEffect(() => {
    const timeouts = undoTimeoutsRef.current;
    return () => timeouts.forEach(clearTimeout);
  }, []);

  const dealNames = useMemo(
    () => Array.from(new Set([...liveRisks, ...liveSignals].map((i) => i.dealName))).sort(),
    [liveRisks, liveSignals],
  );

  const items = useMemo(
    () => tabItems.filter((i) => dealFilter === "all" || i.dealName === dealFilter).sort(byImportance),
    [tabItems, dealFilter],
  );
  const criticalCount = items.filter((i) => i.severity === "critical").length;

  const handleConfirm = (item: DetectedSignal) => {
    processSignalWithActions(item);
    setShowConfirmDialog(true);
  };

  const handleIgnoreWithUndo = (item: DetectedSignal) => {
    const id = item.id;
    const label = item.type === "risk" ? "Risk" : "Signal";
    ignoreSignal(id);
    clearTimeout(undoTimeoutsRef.current.get(id));

    const { dismiss } = toast({
      title: `${label} ignored`,
      description: item.trigger.length > 50 ? `${item.trigger.slice(0, 50)}...` : item.trigger,
      action: (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            clearTimeout(undoTimeoutsRef.current.get(id));
            undoTimeoutsRef.current.delete(id);
            unignoreSignal(id);
            dismiss();
            toast({ title: `${label} restored`, description: "The item has been moved back to pending." });
          }}
        >
          Undo
        </Button>
      ),
      duration: 5000,
    });

    undoTimeoutsRef.current.set(id, setTimeout(() => undoTimeoutsRef.current.delete(id), 5000));
  };

  const confirmIgnoreAll = () => {
    ignoreAllSignals(type);
    toast({ title: `${tabItems.length} ${activeTab} ignored`, description: "All items have been moved to History." });
    setShowIgnoreAllConfirm(false);
  };

  const handleConfirmAll = () => {
    processAllWithActions(type);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-popup flex flex-col gap-0 p-0">
        {/* Header: title + meta, then one scrolling chip row (type + deal) */}
        <div className="shrink-0 space-y-3 border-b border-border p-4 sm:p-6 sm:pb-4">
          <div className="pr-10">
            <DialogTitle className="flex items-center gap-2 text-lg">
              {activeTab === "risks" ? <AlertTriangle className="w-5 h-5 text-danger" /> : <Bell className="w-5 h-5 text-primary" />}
              {activeTab === "risks" ? "Deal risks" : "Signals"}
            </DialogTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} pending{criticalCount > 0 && ` · ${criticalCount} critical`}
              {dealFilter !== "all" && ` · ${dealFilter}`}
            </p>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            <button className={chip(activeTab === "risks")} onClick={() => setActiveTab("risks")}>
              Risks {liveRisks.length}
            </button>
            <button className={chip(activeTab === "signals")} onClick={() => setActiveTab("signals")}>
              Signals {liveSignals.length}
            </button>
            <span className="w-px shrink-0 self-stretch bg-border" />
            {["all", ...dealNames].map((deal) => (
              <button key={deal} className={chip(dealFilter === deal)} onClick={() => setDealFilter(deal)}>
                {deal === "all" ? "All deals" : deal}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:px-6 space-y-3">
          {items.map((item) => (
            <SignalItem
              key={item.id}
              item={item}
              onConfirm={() => handleConfirm(item)}
              onIgnore={() => handleIgnoreWithUndo(item)}
            />
          ))}
          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No {activeTab} right now. New ones appear as Loomik picks them up.
            </p>
          )}
        </div>

        {/* Sticky footer: bulk actions */}
        <div className="shrink-0 border-t border-border p-4 sm:px-6 flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => setShowIgnoreAllConfirm(true)}
            disabled={tabItems.length === 0}
          >
            Ignore all
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleConfirmAll} disabled={tabItems.length === 0}>
            Confirm all
          </Button>
        </div>
      </DialogContent>

      {/* Result of confirming: the actions Loomik generated */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">{Label} confirmed</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2 text-sm">
                <p className="text-foreground">
                  <span className="font-medium text-success">+{lastProcessingResult?.actionsAdded ?? 0}</span> actions added ·{" "}
                  <span className="font-medium">{lastProcessingResult?.actionsModified ?? 0}</span> modified. Scores updated.
                </p>
                {!!lastProcessingResult?.actions?.length && (
                  <ul className="space-y-2">
                    {lastProcessingResult.actions.slice(0, 3).map((action, idx) => {
                      const stakeholder = action.stakeholderIds[0] ? getStakeholderById(action.stakeholderIds[0]) : null;
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <span className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", priorityDot(action.priority))} />
                          <div className="min-w-0">
                            <p className="text-foreground line-clamp-1">{action.title}</p>
                            {stakeholder && (
                              <p className="text-xs text-muted-foreground">
                                {stakeholder.name} · {action.type === "email" ? "Email" : "Meeting"} · {action.deadline}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                    {lastProcessingResult.actions.length > 3 && (
                      <li className="text-xs text-muted-foreground">+{lastProcessingResult.actions.length - 3} more</li>
                    )}
                  </ul>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
            <AlertDialogCancel onClick={handleDismissConfirm}>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleShowUpdatedActions} className="gap-1.5">
              Show actions <ArrowRight className="w-3.5 h-3.5" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showIgnoreAllConfirm} onOpenChange={setShowIgnoreAllConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Ignore all {activeTab}?</AlertDialogTitle>
            <AlertDialogDescription>
              This moves {tabItems.length} {activeTab} to History. You can restore them there.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2 pt-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmIgnoreAll}>Ignore all</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default RisksSignalsDialog;
