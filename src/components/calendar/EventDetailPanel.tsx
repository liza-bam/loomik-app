import { Phone, Video, Share2, X, Users, Briefcase, Paperclip, FileText, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { deals, getStakeholdersForDeal, stageConfig, companies, type Stakeholder } from "@/data/dealData";
import userAvatar from "@/assets/user-avatar.jpg";
import type { CalendarEvent } from "@/contexts/EventPopupContext";
import CallRecordingPanel from "./CallRecordingPanel";
import { avatarFallback, scoreText } from "@/lib/tone";

type Rsvp = "accepted" | "declined" | "maybe" | "pending";

const RSVP_LABEL: Record<Rsvp, string> = { accepted: "Accepted", declined: "Declined", maybe: "Maybe", pending: "No reply" };

interface Person {
  name: string;
  role: string;
  avatar?: string;
  rsvp: Rsvp;
}

// Our side of the call (mock)
const team: Person[] = [
  { name: "Ryan Anderson", role: "Host · Deal Manager", avatar: userAvatar, rsvp: "accepted" },
  { name: "Sarah Chen", role: "Account Executive", rsvp: "accepted" },
  { name: "Mike Johnson", role: "Technical Sales", rsvp: "accepted" },
  { name: "Lisa Wang", role: "Sales Manager", rsvp: "maybe" },
];

// Mock meeting materials
const materials = [
  { name: "Q1 Proposal Deck.pdf", isLink: false },
  { name: "ROI Calculator.xlsx", isLink: false },
  { name: "Meeting Agenda", isLink: true },
];

// Mock RSVP for client stakeholders, based on their sentiment
const stakeholderRsvp = (s: Stakeholder): Rsvp =>
  s.status === "positive" ? "accepted" : s.status === "negative" ? "declined" : s.id % 2 === 0 ? "maybe" : "pending";

const initials = (name: string) => name.split(" ").map((n) => n[0]).join("");

const PersonRow = ({ person }: { person: Person }) => (
  <li className="flex items-center gap-3">
    <Avatar className="w-8 h-8">
      <AvatarImage src={person.avatar} />
      <AvatarFallback className={`${avatarFallback} text-xs font-medium`}>{initials(person.name)}</AvatarFallback>
    </Avatar>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
      <p className="truncate text-xs text-muted-foreground">{person.role}</p>
    </div>
    <span className={`text-xs ${person.rsvp === "declined" ? "text-danger" : "text-muted-foreground"}`}>{RSVP_LABEL[person.rsvp]}</span>
  </li>
);

interface EventDetailPanelProps {
  event: CalendarEvent;
  /** Shows a close button. Omit inside a Dialog, which has its own. */
  onClose?: () => void;
}

/**
 * Calendar event: header (title, time, company), who, then the main thing —
 * the recording for a finished call, or Join / Call in the footer for an upcoming one.
 * Deal context, participants and materials are folded.
 */
export const EventDetailPanel = ({ event, onClose }: EventDetailPanelProps) => {
  const company = companies.find((c) => c.name === event.company);
  const deal = company ? deals.find((d) => d.companyId === company.id) : undefined;
  const stage = deal ? stageConfig[deal.stage] : null;
  const isCompleted = event.status === "completed";

  const people: Person[] = [
    ...team,
    ...(deal ? getStakeholdersForDeal(deal.id) : []).map((s) => ({
      name: s.name,
      role: s.role,
      avatar: s.avatar,
      rsvp: stakeholderRsvp(s),
    })),
  ];
  const clients = people.slice(team.length);

  const meta = [
    event.time,
    event.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    event.type === "call" ? "Phone call" : "Zoom",
    event.company,
  ].join(" · ");

  const handleStart = () => console.log("Starting call for event:", event.id);
  const handleShare = () => console.log("Sharing invite for event:", event.id);

  return (
    <div className="relative h-full min-h-0 flex-1 flex flex-col bg-background">
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3 z-10" aria-label="Close">
          <X className="w-4 h-4" />
        </Button>
      )}

      {/* Header: title + meta, then who */}
      <div className="shrink-0 space-y-3 p-4 pr-12 sm:p-6 sm:pr-14 sm:pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">{event.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {people.slice(0, 4).map((p) => (
              <Avatar key={p.name} className="w-7 h-7 border-2 border-background">
                <AvatarImage src={p.avatar} />
                <AvatarFallback className={`${avatarFallback} text-xxs`}>{initials(p.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            {clients.length > 0 ? clients.slice(0, 2).map((c) => c.name).join(", ") : team[0].name}
            {people.length > 2 && ` +${people.length - 2}`}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 sm:px-6 space-y-4">
        {/* Main task */}
        {event.description && <p className="text-sm text-foreground">{event.description}</p>}
        {isCompleted && <CallRecordingPanel />}

        {/* Everything else folded */}
        <div>
          {deal && company && (
            <Disclosure title="Deal" icon={Briefcase} summary={`${deal.value} · ${deal.winProbability}% win`}>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{company.name}</span>
                  {stage && (
                    <Badge variant="outline" className={`gap-1.5 ${stage.colorClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stage.dotColor}`} />
                      {stage.label}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{deal.summary.headline}</p>
                <p className="text-sm text-muted-foreground">
                  {deal.value} · <span className={`font-medium ${scoreText(deal.winProbability)}`}>{deal.winProbability}%</span> win probability
                </p>
              </div>
            </Disclosure>
          )}

          <Disclosure title="Participants" icon={Users} summary={people.length}>
            <div className="space-y-4">
              {clients.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">{event.company}</p>
                  <ul className="space-y-3">
                    {clients.map((p) => <PersonRow key={p.name} person={p} />)}
                  </ul>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Our team</p>
                <ul className="space-y-3">
                  {team.map((p) => <PersonRow key={p.name} person={p} />)}
                </ul>
              </div>
            </div>
          </Disclosure>

          <Disclosure title="Materials" icon={Paperclip} summary={`${materials.length} files`}>
            <ul className="space-y-2">
              {materials.map((m) => (
                <li key={m.name} className="flex items-center gap-2 text-sm text-foreground">
                  {m.isLink ? <Link2 className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
                  {m.name}
                </li>
              ))}
            </ul>
          </Disclosure>
        </div>
      </div>

      {/* Sticky footer: one primary action */}
      <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="outline" onClick={handleShare} className="w-full sm:w-auto gap-1.5">
          <Share2 className="w-4 h-4" /> Share
        </Button>
        {!isCompleted && (
          <Button onClick={handleStart} className="w-full sm:w-auto gap-1.5">
            {event.type === "call" ? <Phone className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {event.type === "call" ? "Start call" : "Join meeting"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EventDetailPanel;
