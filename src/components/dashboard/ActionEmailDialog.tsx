import { useState, useRef } from "react";
import { Mail, Paperclip, Upload, Sparkles, Clock, ChevronRight, X, Send, Archive, CheckCircle2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ArchiveConfirmDialog from "./ArchiveConfirmDialog";
import { getStakeholderById, avatarColors } from "@/data/dealData";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

interface Attachment {
  name: string;
  type: string;
  file?: File;
}

export interface CrossSellData {
  offeringName: string;
  alignmentPct: number;
  signals: { source: string; stakeholder: string; quote: string }[];
  buyerNeed: string;
  capabilityMatch: string;
  costOfInaction: string;
}

interface ActionEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: {
    id: number;
    stakeholderIds?: number[];
    stakeholderName: string;
    stakeholderRole: string;
    artifact: string;
    basedOn: string;
    priority: "high" | "medium" | "low";
  } | null;
  company?: string;
  companyLogo?: string;
  onNextAction?: () => void;
  hasNextAction?: boolean;
  onArchive?: () => void;
  onMarkDone?: () => void;
  crossSellData?: CrossSellData | null;
}

const ActionEmailDialog = ({
  open,
  onOpenChange,
  action,
  company,
  companyLogo,
  onNextAction,
  hasNextAction = false,
  onArchive,
  onMarkDone,
  crossSellData,
}: ActionEmailDialogProps) => {
  // Return null early if no action
  if (!action) return null;
  
  const isCrossSell = !!crossSellData;
  
  const [toEmail, setToEmail] = useState(`${action.stakeholderName.toLowerCase().replace(" ", ".")}@${(company || "company").toLowerCase()}.com`);
  const [ccEmail, setCcEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Aligning on ROI & Budget — Quick Working Session with You + CFO`);
  const [emailBody, setEmailBody] = useState(
    `Hi ${action.stakeholderName.split(" ")[0]},\n\nThank you for the candid feedback on pricing during our last conversation. I understand the concerns about budget alignment and wanted to follow up with a clear path forward.\n\nTo ensure we're inside your budget cap and that the investment case is bulletproof, I'd like to schedule a focused ROI review session with you and your finance team. During this session, we'll:\n\n• Walk through the detailed ROI forecast with your specific metrics\n• Validate our assumptions against your actual operational data\n• Tie projected outcomes directly to your strategic KPIs\n• Explore right-sized deployment options (e.g., phased rollout, pilot program)\n• Discuss flexible payment structures that align with your budget cycles\n\nOur goal is to make the value story and spend both work for you—no compromises on outcomes.\n\nI'm confident we can find an approach that delivers the results you need while respecting your budget constraints. Would you be available for a 30-minute call this week to explore these options together?\n\nLooking forward to connecting and finding the right solution for your team.\n\nBest regards`
  );
  const [attachments, setAttachments] = useState<Attachment[]>([
    { name: "Problem Statement Brief", type: "PDF" },
    { name: "Value Summary", type: "DOCX" },
  ]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [emailOpened, setEmailOpened] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red text-white";
      case "medium":
        return "bg-yellow text-black";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getDeadlineText = () => {
    if (action.priority === "high") return "Today, 2 PM";
    if (action.priority === "medium") return "Tomorrow, 10 AM";
    return "This week";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments: Attachment[] = Array.from(files).map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: file.name.split('.').pop()?.toUpperCase() || "FILE",
        file: file
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenEmail = () => {
    const mailtoLink = `mailto:${encodeURIComponent(toEmail)}${ccEmail ? `?cc=${encodeURIComponent(ccEmail)}` : '?'}${ccEmail ? '&' : ''}subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
    setEmailOpened(true);
  };

  const handleConfirmDone = () => {
    if (onMarkDone) {
      onMarkDone();
      onOpenChange(false);
    }
  };

  const handleArchiveConfirm = () => {
    setArchiveDialogOpen(false);
    if (onArchive) {
      onArchive();
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[80vw] max-w-none max-h-[90vh] overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Top Bar - Compact */}
          <div className="px-4 py-3 pr-14 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-purple" />
                <span className="font-semibold text-sm text-foreground">Email</span>
              </div>
              {isCrossSell && (
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 uppercase text-xxs font-semibold" variant="outline">
                  Cross-sell opportunity
                </Badge>
              )}
              <Badge className={`${getPriorityColor(action.priority)} uppercase text-xxs font-semibold`}>
                {action.priority}
              </Badge>
              <Badge variant="outline" className="text-green border-green bg-green/10 text-xxs">
                <Sparkles className="w-3 h-3 mr-1" />
                +15% win probability
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-foreground">Deadline: {getDeadlineText()}</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Column - Context */}
            <div className="lg:w-2/5 p-4 lg:border-r border-border space-y-4">
              {/* Header - Title */}
              <DialogTitle className="text-lg font-semibold text-foreground">
                {action.artifact}
              </DialogTitle>

              {/* Stakeholder Info - Compact */}
              {(() => {
                const stakeholderIds = action.stakeholderIds || [];
                const allStakeholders = stakeholderIds.map(id => getStakeholderById(id)).filter(Boolean);

                if (allStakeholders.length === 0) {
                  return (
                    <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                          {action.stakeholderName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{action.stakeholderName}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.stakeholderRole}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-wrap gap-2">
                    {allStakeholders.map((sh) => sh && (
                      <div key={sh.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <Avatar className="w-8 h-8 ring-2 ring-purple/20">
                          <AvatarImage src={sh.avatar} />
                          <AvatarFallback className={`${getAvatarColor(sh.id)} text-xs font-medium`}>
                            {sh.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{sh.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{sh.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Two-column grid for Reason + Attachments on tablet */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                {/* AI Reasoning */}
                <div className="bg-purple/5 rounded-lg p-3">
                  <span className="text-xs font-semibold text-purple mb-1 block">
                    {isCrossSell ? "Why this offering is recommended" : "Why we need to do this"}
                  </span>
                  {isCrossSell && crossSellData ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Based on {crossSellData.signals.length} buyer signals, <strong>{crossSellData.offeringName}</strong> addresses unmet needs with {crossSellData.alignmentPct}% alignment. Key signals include:
                      </p>
                      <div className="space-y-1">
                        {crossSellData.signals.slice(0, 2).map((sig, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">[{sig.source}]</span>{" "}
                            {sig.stakeholder}: "{sig.quote.slice(0, 80)}…"
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {action.stakeholderName} raised budget concerns. An ROI review will validate assumptions and explore flexible options to fit their budget.
                      </p>
                      {(() => {
                        const stakeholderIds = action.stakeholderIds || [];
                        const firstStakeholder = stakeholderIds.length > 0 ? getStakeholderById(stakeholderIds[0]) : null;
                        const topPrimitives = firstStakeholder ? getPrimitivesForRole(firstStakeholder.role).slice(0, 2) : [];
                        
                        if (topPrimitives.length === 0) return null;
                        
                        return (
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-purple/10">
                            {topPrimitives.map(p => {
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
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Offering One-Pager (cross-sell only) */}
                {isCrossSell && crossSellData && (
                  <div className="bg-green/5 border border-green/20 rounded-lg p-3 space-y-2.5">
                    <span className="text-xs font-semibold text-green block">Offering One-Pager</span>
                    <div>
                      <p className="text-xxs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Buyer Need</p>
                      <p className="text-xs text-foreground">{crossSellData.buyerNeed}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Capability Match</p>
                      <p className="text-xs text-foreground">{crossSellData.capabilityMatch}</p>
                    </div>
                    <div>
                      <p className="text-xxs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Supporting Signals</p>
                      <div className="space-y-1">
                        {crossSellData.signals.map((sig, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">
                            <span className="font-medium text-foreground/70">[{sig.source}]</span>{" "}
                            {sig.stakeholder}: "{sig.quote}"
                          </p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xxs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Cost of Inaction</p>
                      <p className="text-xs text-red font-medium">{crossSellData.costOfInaction}</p>
                    </div>
                  </div>
                )}

                {/* Attachments */}
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Attachments</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center gap-1.5 bg-background rounded px-2 py-1">
                        <Paperclip className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-foreground truncate">{attachment.name}</span>
                        <span className="text-xxs text-muted-foreground shrink-0">({attachment.type})</span>
                        <button 
                          className="text-muted-foreground hover:text-foreground ml-auto shrink-0"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 h-7 text-xs mt-1 w-fit"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Editable Content */}
            <div className="lg:w-3/5 p-4 space-y-3">
              {/* Subject Field */}
              <div>
                <label className="text-xxs font-medium text-muted-foreground uppercase tracking-wide">Subject</label>
                <Input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>

              {/* Body Field */}
              <div>
                <label className="text-xxs font-medium text-muted-foreground uppercase tracking-wide">Body</label>
                <Textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="mt-1 min-h-[180px] resize-none text-sm"
                />
              </div>

              {/* To/CC Fields */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground w-7">To:</label>
                  <Input
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    className="flex-1 h-9"
                    placeholder="recipient@company.com"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground w-7">CC:</label>
                  <Input
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    className="flex-1 h-9"
                    placeholder="cc@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Compact */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <Button 
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setArchiveDialogOpen(true)}
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
            <div className="flex items-center gap-2">
              {isCrossSell ? (
                <>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={handleOpenEmail}
                  >
                    Preview & Edit
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-red hover:bg-red/90 text-white gap-1.5"
                    onClick={handleOpenEmail}
                  >
                    <Send className="w-4 h-4" />
                    Send Now
                  </Button>
                  <button 
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                    onClick={() => {}}
                  >
                    Schedule
                  </button>
                </>
              ) : (
                <>
                  {!emailOpened ? (
                    <Button 
                      size="sm"
                      className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white gap-1.5"
                      onClick={handleOpenEmail}
                    >
                      <Send className="w-4 h-4" />
                      Open Email
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      className="bg-green hover:bg-green/90 text-white gap-1.5"
                      onClick={handleConfirmDone}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Done
                    </Button>
                  )}
                  {hasNextAction && (
                    <Button
                      size="sm"
                      className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white gap-1"
                      onClick={onNextAction}
                    >
                      Next Action
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ArchiveConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        onConfirm={handleArchiveConfirm}
        actionTitle={action.artifact}
      />
    </>
  );
};

export default ActionEmailDialog;
