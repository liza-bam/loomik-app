import { useState, useRef } from "react";
import { Paperclip, Upload, Sparkles, Clock, ChevronRight, X, Calendar, Video, Archive, CheckCircle2, Users } from "lucide-react";
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
import { ValuePrimitiveBadge } from "@/components/value-primitives/ValuePrimitiveBadge";
import { getTopPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

interface Attachment {
  name: string;
  type: string;
  file?: File;
}

interface ActionMeetingDialogProps {
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
}

const ActionMeetingDialog = ({
  open,
  onOpenChange,
  action,
  company,
  companyLogo,
  onNextAction,
  hasNextAction = false,
  onArchive,
  onMarkDone,
}: ActionMeetingDialogProps) => {
  // Return null early if no action
  if (!action) return null;
  
  const [invitees, setInvitees] = useState(`${action.stakeholderName.toLowerCase().replace(" ", ".")}@${(company || "company").toLowerCase()}.com`);
  const [ccEmail, setCcEmail] = useState("");
  const [meetingTitle, setMeetingTitle] = useState(`Technical Deep-Dive: ${action.artifact}`);
  const [meetingAgenda, setMeetingAgenda] = useState(
    `Agenda:\n\n1. Welcome and introductions (2 min)\n   - Brief overview of meeting objectives\n   - Confirm attendee roles and expectations\n\n2. Review current technical requirements and concerns (10 min)\n   - Walk through ${action.artifact} documentation in detail\n   - Address specific technical questions from ${action.stakeholderName.split(" ")[0]}'s team\n   - Clarify any ambiguous requirements or specifications\n\n3. Deep-dive demonstration (15 min)\n   - Live walkthrough of relevant platform capabilities\n   - Show integration points and API endpoints\n   - Demonstrate security and compliance features\n\n4. Implementation timeline and resource planning (8 min)\n   - Review proposed deployment phases\n   - Discuss internal resource requirements\n   - Identify potential blockers and mitigation strategies\n\n5. Q&A and open discussion (10 min)\n   - Address remaining technical concerns\n   - Discuss next steps and action items\n   - Schedule follow-up sessions if needed\n\nPre-read materials attached. Please come prepared with any technical questions or specific use cases you'd like to explore.`
  );
  const [selectedTimeIndex, setSelectedTimeIndex] = useState<number | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([
    { name: "Technical Architecture Doc", type: "PDF" },
    { name: "Integration Roadmap", type: "PPTX" },
  ]);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [callScheduled, setCallScheduled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedTimes = [
    { day: "Today", time: "3:00 PM", duration: "30 min", date: new Date() },
    { day: "Tomorrow", time: "10:00 AM", duration: "30 min", date: new Date(Date.now() + 86400000) },
    { day: "Tomorrow", time: "2:00 PM", duration: "45 min", date: new Date(Date.now() + 86400000) },
  ];

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
    if (action.priority === "high") return "Schedule within 24 hours";
    if (action.priority === "medium") return "Schedule this week";
    return "Schedule when convenient";
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleScheduleCall = () => {
    const slot = selectedTimeIndex !== null ? suggestedTimes[selectedTimeIndex] : suggestedTimes[0];
    const startDate = new Date(slot.date);
    
    // Set the time based on the slot
    if (slot.time.includes("3:00 PM")) {
      startDate.setHours(15, 0, 0, 0);
    } else if (slot.time.includes("10:00 AM")) {
      startDate.setHours(10, 0, 0, 0);
    } else if (slot.time.includes("2:00 PM")) {
      startDate.setHours(14, 0, 0, 0);
    }
    
    const durationMinutes = slot.duration.includes("45") ? 45 : 30;
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    // Format dates for Google Calendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingTitle)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(meetingAgenda)}&add=${encodeURIComponent(invitees)}${ccEmail ? `,${encodeURIComponent(ccEmail)}` : ''}`;
    
    window.open(googleCalendarUrl, '_blank');
    setCallScheduled(true);
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
          {/* Top Bar - Deadline & Action Type */}
          <div className="px-6 pt-6 pb-4 pr-14 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-purple" />
                <span className="font-semibold text-foreground">Meeting</span>
              </div>
              <Badge className={`${getPriorityColor(action.priority)} uppercase text-xs font-semibold`}>
                {action.priority}
              </Badge>
              <Badge variant="outline" className="text-green border-green bg-green/10">
                <Sparkles className="w-3 h-3 mr-1" />
                +12% win probability
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{getDeadlineText()}</span>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row">
            {/* Left Column - Context */}
            <div className="lg:w-2/5 p-6 lg:border-r border-border space-y-6">
              {/* Header - Title */}
              <div>
                <DialogTitle className="text-xl font-semibold text-foreground">
                  {action.artifact}
                </DialogTitle>
              </div>

              {/* Stakeholder Info */}
              {(() => {
                const stakeholderIds = action.stakeholderIds || [];
                const allStakeholders = stakeholderIds.map(id => getStakeholderById(id)).filter(Boolean);

                if (allStakeholders.length === 0) {
                  return (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                          {action.stakeholderName.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{action.stakeholderName}</p>
                        <p className="text-sm text-muted-foreground truncate">{action.stakeholderRole} at {company}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {allStakeholders.map((sh) => sh && (
                      <div key={sh.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Avatar className="w-10 h-10 ring-2 ring-purple/20">
                          <AvatarImage src={sh.avatar} />
                          <AvatarFallback className={`${getAvatarColor(sh.id)} text-sm font-medium`}>
                            {sh.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{sh.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{sh.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* AI Reasoning - Why we need to do it with primitive context */}
              <div className="bg-purple/5 border-0 rounded-lg p-5 min-h-[90px]">
                <span className="text-sm font-semibold text-purple mb-2 block">Why we need to do this</span>
                {(() => {
                  const stakeholderIds = action.stakeholderIds || [];
                  const firstStakeholder = stakeholderIds.length > 0 ? getStakeholderById(stakeholderIds[0]) : null;
                  const topPrimitives = firstStakeholder ? getTopPrimitivesForRole(firstStakeholder.role, 2) : [];
                  const primitiveLabels = topPrimitives.map(p => getPrimitiveById(p)?.label).filter(Boolean);
                  
                  return (
                    <>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {action.stakeholderName} needs technical clarity on {action.artifact.toLowerCase()}. A direct call will accelerate alignment.
                      </p>
                      {topPrimitives.length > 0 && (
                        <div className="pt-2 border-t border-purple/10">
                          <p className="text-xs text-muted-foreground mb-2">Addresses value primitives:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {topPrimitives.map(primitiveId => (
                              <ValuePrimitiveBadge 
                                key={primitiveId} 
                                primitiveId={primitiveId} 
                                size="sm" 
                                showLabel={true}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Attachments */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Pre-Read Materials</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted/50 border-0 rounded-lg px-3 py-2"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground">({attachment.type})</span>
                      <button 
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Editable Content */}
            <div className="lg:w-3/5 p-6 space-y-4">
              {/* Meeting Title Field */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Meeting Title</label>
                <Input
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Suggested Times */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Suggested Times</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTimes.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTimeIndex(index)}
                      className={`px-3 py-2 rounded-lg border-0 transition-colors text-sm ${
                        selectedTimeIndex === index 
                          ? 'bg-purple/10 text-purple ring-2 ring-purple' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium text-foreground">{slot.day}</span>
                      <span className="text-muted-foreground"> at {slot.time}</span>
                      <span className="text-xs text-muted-foreground/70 ml-1">({slot.duration})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agenda Field */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agenda</label>
                <Textarea
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  className="mt-1 min-h-[210px] resize-none"
                />
              </div>

              {/* Invitees Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-muted-foreground w-16">Invitees:</label>
                  <Input
                    value={invitees}
                    onChange={(e) => setInvitees(e.target.value)}
                    className="flex-1"
                    placeholder="invitee@company.com"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-muted-foreground w-16">Optional:</label>
                  <Input
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    className="flex-1"
                    placeholder="optional@company.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex items-center justify-between">
            <Button 
              variant="outline"
              className="gap-2"
              onClick={() => setArchiveDialogOpen(true)}
            >
              <Archive className="w-4 h-4" />
              Archive
            </Button>
            <div className="flex items-center gap-3">
              {!callScheduled ? (
                <Button 
                  className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white gap-2"
                  onClick={handleScheduleCall}
                >
                  <Video className="w-4 h-4" />
                  Schedule Call
                </Button>
              ) : (
                <Button 
                  className="bg-green hover:bg-green/90 text-white gap-2"
                  onClick={handleConfirmDone}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Done
                </Button>
              )}
              {hasNextAction && (
                <Button
                  className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white gap-1"
                  onClick={onNextAction}
                >
                  Next Action
                  <ChevronRight className="w-4 h-4" />
                </Button>
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

export default ActionMeetingDialog;
