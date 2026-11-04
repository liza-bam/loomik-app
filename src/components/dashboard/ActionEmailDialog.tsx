import { useState, useRef } from "react";
import { Mail, Paperclip, Upload, ChevronRight, X, Send, Archive, CheckCircle2, Lightbulb, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Disclosure } from "@/components/ui/disclosure";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import { getStakeholderById } from "@/data/dealData";
import { avatarFallback, categoryBadge, priorityDot } from "@/lib/tone";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

export interface CrossSellData {
  offeringName: string;
  alignmentPct: number;
  signals: { source: string; stakeholder: string; quote: string }[];
  buyerNeed: string;
  capabilityMatch: string;
  costOfInaction: string;
}

export interface DialogAction {
  id: number;
  stakeholderIds?: number[];
  stakeholderName: string;
  stakeholderRole: string;
  artifact: string;
  basedOn: string;
  priority: "high" | "medium" | "low";
}

export interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: DialogAction | null;
  company?: string;
  companyLogo?: string;
  onNextAction?: () => void;
  hasNextAction?: boolean;
  onArchive?: () => void;
  onMarkDone?: () => void;
}

/* ---------- Shared building blocks for the action dialogs (email + meeting) ---------- */

/** Bottom sheet on phones, centred single-column dialog on larger screens. */
export const actionDialogClass = "grid-cols-1 max-w-2xl max-h-dialog overflow-y-auto gap-0 p-0";

export const ActionDialogHeader = ({ icon: Icon, title, priority, meta }: {
  icon: React.ElementType;
  title: string;
  priority: string;
  meta: string[];
}) => (
  <div className="p-4 pr-14 sm:px-6 sm:pt-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <DialogTitle className="text-base leading-tight">{title}</DialogTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${priorityDot(priority)}`} />
          {meta.join(" · ")}
        </p>
      </div>
    </div>
  </div>
);

/** Who: overlapping avatars + names on one line. */
export const WhoLine = ({ action, company }: { action: DialogAction; company?: string }) => {
  const people = (action.stakeholderIds || []).map(getStakeholderById).filter(Boolean) as NonNullable<ReturnType<typeof getStakeholderById>>[];
  const list = people.length ? people : [{ id: 0, name: action.stakeholderName, role: action.stakeholderRole, avatar: undefined }];
  const detail = list.length === 1 ? list[0].role : company;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex -space-x-2 shrink-0">
        {list.slice(0, 3).map((p) => (
          <Avatar key={p.id} className="w-7 h-7 border-2 border-background">
            <AvatarImage src={p.avatar} />
            <AvatarFallback className={`text-xxs font-medium ${avatarFallback}`}>
              {p.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className="text-sm text-foreground truncate">
        {list.map((p) => p.name).join(", ")}
        {detail && <span className="text-muted-foreground"> · {detail}</span>}
      </p>
    </div>
  );
};

/** Value primitives of the first stakeholder as neutral tags. */
export const PrimitiveTags = ({ action }: { action: DialogAction }) => {
  const first = action.stakeholderIds?.length ? getStakeholderById(action.stakeholderIds[0]) : null;
  const primitives = first ? getPrimitivesForRole(first.role).slice(0, 2) : [];
  if (!primitives.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {primitives.map((p) => (
        <span key={p.primitiveId} className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadge}`}>
          {getPrimitiveById(p.primitiveId)?.shortLabel}
        </span>
      ))}
    </div>
  );
};

interface Attachment {
  name: string;
  type: string;
}

/** Folded attachment list with upload / remove. */
export const AttachmentsDisclosure = ({ title, initial }: { title: string; initial: Attachment[] }) => {
  const [attachments, setAttachments] = useState(initial);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({ name: f.name.replace(/\.[^/.]+$/, ""), type: f.name.split(".").pop()?.toUpperCase() || "FILE" })),
    ]);
    event.target.value = "";
  };

  return (
    <Disclosure title={title} icon={Paperclip} summary={`${attachments.length} files`}>
      <div className="space-y-1">
        {attachments.map((a, index) => (
          <div key={index} className="flex items-center gap-2 rounded-lg bg-muted pl-3">
            <span className="flex-1 truncate text-sm text-foreground">{a.name}</span>
            <span className="text-xs text-muted-foreground">{a.type}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${a.name}`}
              onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))}
            >
              <X />
            </Button>
          </div>
        ))}
      </div>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
      <Button variant="outline" size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()}>
        <Upload />
        Upload
      </Button>
    </Disclosure>
  );
};

/** Sticky footer: archive as icon, optional "Next", one primary action. */
export const ActionDialogFooter = ({ title, onArchive, onOpenChange, hasNextAction, onNextAction, children }: {
  title: string;
  onArchive?: () => void;
  onOpenChange: (open: boolean) => void;
  hasNextAction?: boolean;
  onNextAction?: () => void;
  children: React.ReactNode;
}) => {
  const [archiveOpen, setArchiveOpen] = useState(false);

  return (
    <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-border bg-background p-4 sm:px-6">
      <Button variant="ghost" size="icon" aria-label="Archive" title="Archive" onClick={() => setArchiveOpen(true)}>
        <Archive />
      </Button>
      <span className="flex-1 max-sm:hidden" />
      {hasNextAction && (
        <Button variant="outline" onClick={onNextAction}>
          Next
          <ChevronRight />
        </Button>
      )}
      {children}
      <ArchiveConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        actionTitle={title}
        onConfirm={() => {
          setArchiveOpen(false);
          onArchive?.();
          onOpenChange(false);
        }}
      />
    </div>
  );
};

export const fieldLabel = "text-xs font-medium text-muted-foreground";

/* ---------- Email dialog ---------- */

const deadlineText = { high: "Due today 2 PM", medium: "Due tomorrow 10 AM", low: "Due this week" };

const EmailDialogBody = ({
  open,
  onOpenChange,
  action,
  company,
  onNextAction,
  hasNextAction = false,
  onArchive,
  onMarkDone,
  crossSellData,
}: ActionDialogProps & { action: DialogAction; crossSellData?: CrossSellData | null }) => {
  const [toEmail, setToEmail] = useState(`${action.stakeholderName.toLowerCase().replace(" ", ".")}@${(company || "company").toLowerCase()}.com`);
  const [ccEmail, setCcEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Aligning on ROI & Budget — Quick Working Session with You + CFO`);
  const [emailBody, setEmailBody] = useState(
    `Hi ${action.stakeholderName.split(" ")[0]},\n\nThank you for the candid feedback on pricing during our last conversation. I understand the concerns about budget alignment and wanted to follow up with a clear path forward.\n\nTo ensure we're inside your budget cap and that the investment case is bulletproof, I'd like to schedule a focused ROI review session with you and your finance team. During this session, we'll:\n\n• Walk through the detailed ROI forecast with your specific metrics\n• Validate our assumptions against your actual operational data\n• Tie projected outcomes directly to your strategic KPIs\n• Explore right-sized deployment options (e.g., phased rollout, pilot program)\n• Discuss flexible payment structures that align with your budget cycles\n\nOur goal is to make the value story and spend both work for you—no compromises on outcomes.\n\nI'm confident we can find an approach that delivers the results you need while respecting your budget constraints. Would you be available for a 30-minute call this week to explore these options together?\n\nLooking forward to connecting and finding the right solution for your team.\n\nBest regards`
  );
  const [emailOpened, setEmailOpened] = useState(false);

  const handleOpenEmail = () => {
    const params = new URLSearchParams({ ...(ccEmail && { cc: ccEmail }), subject: emailSubject, body: emailBody });
    window.open(`mailto:${encodeURIComponent(toEmail)}?${params.toString().replace(/\+/g, "%20")}`, "_blank");
    setEmailOpened(true);
  };

  const meta = [
    crossSellData ? "Cross-sell" : "Email",
    `${action.priority[0].toUpperCase()}${action.priority.slice(1)} priority`,
    deadlineText[action.priority],
    "+15% win",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={actionDialogClass} onOpenAutoFocus={(e) => e.preventDefault()}>
        <ActionDialogHeader icon={Mail} title={action.artifact} priority={action.priority} meta={meta} />

        <div className="px-4 pb-4 sm:px-6 space-y-4">
          <WhoLine action={action} company={company} />

          {/* Main task: the email itself */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="email-to" className={fieldLabel}>To</label>
              <Input id="email-to" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="recipient@company.com" />
            </div>
            <div className="space-y-1">
              <label htmlFor="email-subject" className={fieldLabel}>Subject</label>
              <Input id="email-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label htmlFor="email-body" className={fieldLabel}>Message</label>
              <Textarea id="email-body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-60 text-sm" />
            </div>
          </div>

          {/* Everything else, folded */}
          <div className="border-t border-border">
            <Disclosure title="Add CC" icon={UserPlus} summary={ccEmail || undefined}>
              <Input aria-label="CC" value={ccEmail} onChange={(e) => setCcEmail(e.target.value)} placeholder="cc@company.com" />
            </Disclosure>

            <Disclosure title={crossSellData ? "Why this offering" : "Why this matters"} icon={Lightbulb}>
              {crossSellData ? (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    {crossSellData.signals.length} buyer signals point to <span className="font-medium text-foreground">{crossSellData.offeringName}</span> ({crossSellData.alignmentPct}% alignment).
                  </p>
                  {[
                    ["Buyer need", crossSellData.buyerNeed],
                    ["Capability match", crossSellData.capabilityMatch],
                    ["Cost of inaction", crossSellData.costOfInaction],
                  ].map(([label, text]) => (
                    <div key={label}>
                      <p className={fieldLabel}>{label}</p>
                      <p className="text-foreground">{text}</p>
                    </div>
                  ))}
                  <div>
                    <p className={fieldLabel}>Signals</p>
                    {crossSellData.signals.map((sig, idx) => (
                      <p key={idx} className="text-muted-foreground mt-1">
                        <span className="font-medium text-foreground">{sig.stakeholder}</span> ({sig.source}): "{sig.quote}"
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {action.stakeholderName} raised budget concerns. An ROI review will validate assumptions and explore flexible options to fit their budget.
                  </p>
                  <PrimitiveTags action={action} />
                </>
              )}
            </Disclosure>

            <AttachmentsDisclosure
              title="Attachments"
              initial={[
                { name: "Problem Statement Brief", type: "PDF" },
                { name: "Value Summary", type: "DOCX" },
              ]}
            />
          </div>
        </div>

        <ActionDialogFooter
          title={action.artifact}
          onArchive={onArchive}
          onOpenChange={onOpenChange}
          hasNextAction={hasNextAction}
          onNextAction={onNextAction}
        >
          {emailOpened && onMarkDone ? (
            <Button className="flex-1 sm:flex-none" onClick={() => { onMarkDone(); onOpenChange(false); }}>
              <CheckCircle2 />
              Confirm done
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none" onClick={handleOpenEmail}>
              <Send />
              {crossSellData ? "Send now" : "Open email"}
            </Button>
          )}
        </ActionDialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Remount per action so the draft resets when "Next" switches to another action.
const ActionEmailDialog = (props: ActionDialogProps & { crossSellData?: CrossSellData | null }) =>
  props.action ? <EmailDialogBody key={props.action.id} {...props} action={props.action} /> : null;

export default ActionEmailDialog;
