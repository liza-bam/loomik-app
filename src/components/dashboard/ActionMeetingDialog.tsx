import { useState } from "react";
import { Video, CheckCircle2, Lightbulb, ListChecks, UserPlus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Disclosure } from "@/components/ui/disclosure";
import { selectedChip } from "@/lib/tone";
import {
  type ActionDialogProps,
  type DialogAction,
  actionDialogClass,
  ActionDialogHeader,
  ActionDialogFooter,
  AttachmentsDisclosure,
  PrimitiveTags,
  WhoLine,
  fieldLabel,
} from "./ActionEmailDialog";

const DAY = 86400000;
const suggestedTimes = [
  { day: "Today", time: "3 PM", hour: 15, minutes: 30, offset: 0 },
  { day: "Tomorrow", time: "10 AM", hour: 10, minutes: 30, offset: DAY },
  { day: "Tomorrow", time: "2 PM", hour: 14, minutes: 45, offset: DAY },
];

const deadlineText = { high: "Schedule within 24h", medium: "Schedule this week", low: "Schedule when convenient" };

const MeetingDialogBody = ({
  open,
  onOpenChange,
  action,
  company,
  onNextAction,
  hasNextAction = false,
  onArchive,
  onMarkDone,
}: ActionDialogProps & { action: DialogAction }) => {
  const [invitees, setInvitees] = useState(`${action.stakeholderName.toLowerCase().replace(" ", ".")}@${(company || "company").toLowerCase()}.com`);
  const [ccEmail, setCcEmail] = useState("");
  const [meetingTitle, setMeetingTitle] = useState(`Technical Deep-Dive: ${action.artifact}`);
  const [meetingAgenda, setMeetingAgenda] = useState(
    `Agenda:\n\n1. Welcome and introductions (2 min)\n   - Brief overview of meeting objectives\n   - Confirm attendee roles and expectations\n\n2. Review current technical requirements and concerns (10 min)\n   - Walk through ${action.artifact} documentation in detail\n   - Address specific technical questions from ${action.stakeholderName.split(" ")[0]}'s team\n   - Clarify any ambiguous requirements or specifications\n\n3. Deep-dive demonstration (15 min)\n   - Live walkthrough of relevant platform capabilities\n   - Show integration points and API endpoints\n   - Demonstrate security and compliance features\n\n4. Implementation timeline and resource planning (8 min)\n   - Review proposed deployment phases\n   - Discuss internal resource requirements\n   - Identify potential blockers and mitigation strategies\n\n5. Q&A and open discussion (10 min)\n   - Address remaining technical concerns\n   - Discuss next steps and action items\n   - Schedule follow-up sessions if needed\n\nPre-read materials attached. Please come prepared with any technical questions or specific use cases you'd like to explore.`
  );
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [callScheduled, setCallScheduled] = useState(false);

  const handleScheduleCall = () => {
    const slot = suggestedTimes[selectedTimeIndex];
    const start = new Date(Date.now() + slot.offset);
    start.setHours(slot.hour, 0, 0, 0);
    const end = new Date(start.getTime() + slot.minutes * 60000);
    const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, "");
    const guests = [invitees, ccEmail].filter(Boolean).map(encodeURIComponent).join(",");

    window.open(
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingTitle)}&dates=${formatDate(start)}/${formatDate(end)}&details=${encodeURIComponent(meetingAgenda)}&add=${guests}`,
      "_blank",
    );
    setCallScheduled(true);
  };

  const meta = [
    "Meeting",
    `${action.priority[0].toUpperCase()}${action.priority.slice(1)} priority`,
    deadlineText[action.priority],
    "+12% win",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={actionDialogClass} onOpenAutoFocus={(e) => e.preventDefault()}>
        <ActionDialogHeader icon={Video} title={action.artifact} priority={action.priority} meta={meta} />

        <div className="px-4 pb-4 sm:px-6 space-y-4">
          <WhoLine action={action} company={company} />

          {/* Main task: pick a time */}
          <div className="space-y-3">
            <div className="space-y-1">
              <p className={fieldLabel}>Pick a time</p>
              <div className="grid grid-cols-3 gap-2">
                {suggestedTimes.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTimeIndex(index)}
                    className={`rounded-lg px-2 py-2 text-left transition-colors ${
                      selectedTimeIndex === index ? `${selectedChip} ring-1 ring-primary` : "bg-muted text-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="block text-sm font-medium">{slot.day}</span>
                    <span className="block text-xs text-muted-foreground">{slot.time} · {slot.minutes} min</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="meeting-title" className={fieldLabel}>Title</label>
              <Input id="meeting-title" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label htmlFor="meeting-invitees" className={fieldLabel}>Invitees</label>
              <Input id="meeting-invitees" value={invitees} onChange={(e) => setInvitees(e.target.value)} placeholder="invitee@company.com" />
            </div>
          </div>

          {/* Everything else, folded */}
          <div className="border-t border-border">
            <Disclosure title="Agenda" icon={ListChecks} summary="5 items">
              <Textarea aria-label="Agenda" value={meetingAgenda} onChange={(e) => setMeetingAgenda(e.target.value)} className="min-h-60 text-sm" />
            </Disclosure>

            <Disclosure title="Add optional invitees" icon={UserPlus} summary={ccEmail || undefined}>
              <Input aria-label="Optional invitees" value={ccEmail} onChange={(e) => setCcEmail(e.target.value)} placeholder="optional@company.com" />
            </Disclosure>

            <Disclosure title="Why this matters" icon={Lightbulb}>
              <p className="text-sm text-muted-foreground">
                {action.stakeholderName} needs technical clarity on {action.artifact.toLowerCase()}. A direct call will accelerate alignment.
              </p>
              <PrimitiveTags action={action} />
            </Disclosure>

            <AttachmentsDisclosure
              title="Pre-read materials"
              initial={[
                { name: "Technical Architecture Doc", type: "PDF" },
                { name: "Integration Roadmap", type: "PPTX" },
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
          {callScheduled && onMarkDone ? (
            <Button className="flex-1 sm:flex-none" onClick={() => { onMarkDone(); onOpenChange(false); }}>
              <CheckCircle2 />
              Confirm done
            </Button>
          ) : (
            <Button className="flex-1 sm:flex-none" onClick={handleScheduleCall}>
              <Video />
              Schedule call
            </Button>
          )}
        </ActionDialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Remount per action so the draft resets when "Next" switches to another action.
const ActionMeetingDialog = (props: ActionDialogProps) =>
  props.action ? <MeetingDialogBody key={props.action.id} {...props} action={props.action} /> : null;

export default ActionMeetingDialog;
