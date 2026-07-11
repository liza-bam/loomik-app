import { Phone, Video, Users, TrendingUp, DollarSign, Share2, Check, X, Circle, FileText, Link2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  avatarColors, 
  deals, 
  getStakeholdersForDeal, 
  stageConfig,
  getCompanyById,
  companies,
  type Stakeholder,
  type Deal,
  type Company
} from "@/data/dealData";
import userAvatar from "@/assets/user-avatar.jpg";
import type { CalendarEvent } from "@/contexts/EventPopupContext";
import CallRecordingPanel from "./CallRecordingPanel";

const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

const getStatusBadgeColor = (status: "positive" | "neutral" | "negative") => {
  switch (status) {
    case "positive": return "bg-green/10 text-green border-green/20";
    case "neutral": return "bg-yellow/10 text-yellow border-yellow/20";
    case "negative": return "bg-red/10 text-red border-red/20";
  }
};

type RsvpStatus = "accepted" | "declined" | "maybe" | "pending";

const RsvpIcon = ({ status }: { status: RsvpStatus }) => {
  switch (status) {
    case "accepted":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-4 h-4 rounded-full bg-green flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Accepted</TooltipContent>
        </Tooltip>
      );
    case "declined":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-4 h-4 rounded-full bg-red flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-white" />
            </div>
          </TooltipTrigger>
          <TooltipContent>Declined</TooltipContent>
        </Tooltip>
      );
    case "maybe":
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-4 h-4 rounded-full bg-yellow flex items-center justify-center">
              <span className="text-xxs font-bold text-white leading-none">?</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>Maybe</TooltipContent>
        </Tooltip>
      );
    case "pending":
    default:
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Circle className="w-4 h-4 text-muted-foreground/40" strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent>No response</TooltipContent>
        </Tooltip>
      );
  }
};

// Host info
const host = {
  name: "Ryan Anderson",
  role: "Deal Manager",
  company: "Acme",
  avatar: userAvatar,
  rsvp: "accepted" as RsvpStatus,
};

// Sales team data with RSVP status
const salesTeam = [
  { name: "Sarah Chen", role: "Account Executive", status: "Active", rsvp: "accepted" as RsvpStatus },
  { name: "Mike Johnson", role: "Technical Sales", status: "Active", rsvp: "accepted" as RsvpStatus },
  { name: "Lisa Wang", role: "Sales Manager", status: "Observer", rsvp: "maybe" as RsvpStatus },
];

// Mock meeting materials
const mockMaterials = [
  { id: 1, name: "Q1 Proposal Deck.pdf", type: "pdf", size: "2.4 MB" },
  { id: 2, name: "ROI Calculator.xlsx", type: "excel", size: "156 KB" },
  { id: 3, name: "Meeting Agenda", type: "link", url: "https://notion.so/..." },
];

// Mock RSVP statuses for stakeholders (based on their sentiment)
const getStakeholderRsvp = (stakeholder: Stakeholder): RsvpStatus => {
  if (stakeholder.status === "positive") return "accepted";
  if (stakeholder.status === "negative") return "declined";
  return stakeholder.id % 2 === 0 ? "maybe" : "pending";
};

interface EventDetailPanelProps {
  event: CalendarEvent;
  onClose: () => void;
}

export const EventDetailPanel = ({ event, onClose }: EventDetailPanelProps) => {
  // Find the deal by matching company name from event to our companies
  const company = companies.find(c => c.name === event.company);
  const deal: Deal | undefined = company ? deals.find(d => d.companyId === company.id) : undefined;
  
  // Get real stakeholders for this deal
  const dealStakeholders: Stakeholder[] = deal ? getStakeholdersForDeal(deal.id) : [];

  const handleStartCall = () => {
    console.log("Starting call for event:", event.id);
  };

  const handleShareInvite = () => {
    console.log("Sharing invite for event:", event.id);
  };

  const stageInfo = deal ? stageConfig[deal.stage] : null;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${event.type === "call" ? "bg-green text-white" : "bg-purple text-white"}`}>
                {event.type}
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                {event.status}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold text-foreground">{event.title}</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {deal?.summary.headline || "Discuss key topics and next steps"}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <span>{event.time}</span>
              <span>•</span>
              <span>{event.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
              <span>•</span>
              <span>{event.type === "call" ? "Phone Call" : "Zoom Meeting"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareInvite}
              className="gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            {event.type === "call" ? (
              <Button
                size="sm"
                onClick={handleStartCall}
                className="bg-gradient-to-r from-green to-emerald-500 hover:from-green/90 hover:to-emerald-500/90 text-white gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                Start Call
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStartCall}
                className="bg-gradient-to-r from-purple to-violet-500 hover:from-purple/90 hover:to-violet-500/90 text-white gap-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                Join Meeting
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Deal Information Card */}
        {deal && (
          <div className="bg-muted/30 border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <img 
                src={company?.logo} 
                alt={company?.name} 
                className="h-10 w-auto max-w-[100px] object-contain"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{company?.name}</h3>
                  {stageInfo && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className={stageInfo.colorClass}>
                          {stageInfo.label}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>{stageInfo.tooltip}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{company?.industry}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-green">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="font-semibold">{deal.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Value</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-purple">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="font-semibold">{deal.winProbability}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Win Prob</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants - Two Column Layout */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Participants</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Host + Sales Team */}
            <div className="space-y-4">
              {/* Host */}
              <div>
                <p className="text-xs font-medium text-purple mb-2">Call Host</p>
                <div className="flex items-center gap-3 p-2 rounded-lg border border-border">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={host.avatar} />
                    <AvatarFallback className="bg-purple/10 text-purple text-sm font-medium">
                      RA
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground text-sm">{host.name}</p>
                    <p className="text-sm text-muted-foreground">{host.role}, {host.company}</p>
                  </div>
                  <RsvpIcon status={host.rsvp} />
                </div>
              </div>

              {/* Sales Team */}
              <div>
                <p className="text-xs font-medium text-purple mb-2">
                  Sales Team ({salesTeam.length})
                </p>
                <div className="space-y-2">
                  {salesTeam.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className={`${getAvatarColor(idx + 10)} text-xs font-medium`}>
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{member.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                      </div>
                      <RsvpIcon status={member.rsvp} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Client Stakeholders */}
            <div>
              <p className="text-xs font-medium text-green mb-2">
                Client Stakeholders ({dealStakeholders.length})
              </p>
              <div className="space-y-2">
                {dealStakeholders.slice(0, 5).map((stakeholder, idx) => (
                  <div key={stakeholder.id} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={stakeholder.avatar} />
                      <AvatarFallback className={`${getAvatarColor(idx)} text-xs font-medium`}>
                        {stakeholder.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground text-sm truncate">
                        {stakeholder.name}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{stakeholder.role}</p>
                    </div>
                    <RsvpIcon status={getStakeholderRsvp(stakeholder)} />
                  </div>
                ))}
                {dealStakeholders.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-1">
                    +{dealStakeholders.length - 5} more
                  </p>
                )}
                {dealStakeholders.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                    No stakeholders linked
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loomik Call Recording - Simulated */}
        <CallRecordingPanel eventTitle={event.title} duration="12:34" />

        {/* Meeting Materials - Inline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Meeting Materials</h3>
            <Button variant="ghost" size="sm" className="text-xs h-6 text-purple hover:text-purple hover:bg-purple/10">
              + Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {mockMaterials.map((material) => (
              <div 
                key={material.id} 
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-purple cursor-pointer transition-colors"
              >
                {material.type === "link" ? (
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                ) : (
                  <FileText className={`w-3.5 h-3.5 ${
                    material.type === "pdf" ? "text-red-500" : "text-green-500"
                  }`} />
                )}
                <span>{material.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPanel;
