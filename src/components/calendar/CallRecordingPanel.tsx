import { useState } from "react";
import { Play, Pause, Sparkles, ListChecks, AlertTriangle, Bookmark, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Disclosure } from "@/components/ui/disclosure";
import { sentimentBadge } from "@/lib/tone";

interface KeyMoment {
  id: number;
  timestamp: string;
  type: "insight" | "risk" | "action" | "question";
  speaker: string;
  content: string;
}

interface TranscriptEntry {
  id: number;
  timestamp: string;
  speaker: string;
  content: string;
}

// Mock transcript data
const mockTranscript: TranscriptEntry[] = [
  { id: 1, timestamp: "00:00", speaker: "Ryan Anderson", content: "Thanks for joining today. Let's dive into the implementation timeline." },
  { id: 2, timestamp: "00:45", speaker: "Sarah Chen", content: "We've been reviewing the proposal internally. The team is excited but we have some concerns about the integration complexity." },
  { id: 3, timestamp: "01:30", speaker: "Ryan Anderson", content: "Absolutely, let me walk you through our phased approach. We've done similar integrations with companies of your size." },
  { id: 4, timestamp: "02:15", speaker: "Michael Park", content: "What's the typical timeline for the data migration piece specifically?" },
  { id: 5, timestamp: "03:00", speaker: "Mike Johnson", content: "For your data volume, we're looking at 2-3 weeks for full migration with minimal downtime." },
  { id: 6, timestamp: "04:30", speaker: "Sarah Chen", content: "That's better than we expected. The CFO was concerned about a 6-week disruption we heard from another vendor." },
  { id: 7, timestamp: "05:15", speaker: "Ryan Anderson", content: "We can definitely beat that. Let me share some case studies from similar implementations." },
  { id: 8, timestamp: "06:00", speaker: "Michael Park", content: "Before we proceed, I need to loop in our security team. They'll want to review the SOC 2 compliance docs." },
  { id: 9, timestamp: "07:30", speaker: "Ryan Anderson", content: "Happy to schedule a dedicated security review call. We can have our CISO join as well." },
  { id: 10, timestamp: "08:15", speaker: "Sarah Chen", content: "That would be great. Let's aim for next week. I think we're moving in the right direction here." },
];

// Mock key moments
const mockKeyMoments: KeyMoment[] = [
  { id: 1, timestamp: "00:45", type: "risk", speaker: "Sarah Chen", content: "Concern raised about integration complexity - needs addressing in follow-up" },
  { id: 2, timestamp: "04:30", type: "insight", speaker: "Sarah Chen", content: "Competitor quoted 6-week migration - we're significantly faster" },
  { id: 3, timestamp: "06:00", type: "action", speaker: "Michael Park", content: "Security team review required before proceeding" },
  { id: 4, timestamp: "07:30", type: "action", speaker: "Ryan Anderson", content: "Committed to scheduling security review call with CISO" },
  { id: 5, timestamp: "08:15", type: "insight", speaker: "Sarah Chen", content: "Positive signal: 'moving in the right direction'" },
];

// Mock AI summary
const mockSummary = {
  headline: "Positive momentum with security review as next gate",
  keyTakeaways: [
    "Client team is excited about the solution but has integration concerns",
    "Our 2-3 week migration timeline is a competitive advantage vs. 6 weeks from competitor",
    "Security review with their team is the critical next step before advancing",
    "CFO influence detected - budget concerns may surface later",
  ],
  sentiment: "positive" as const,
  nextSteps: [
    "Schedule security review call with CISO for next week",
    "Send SOC 2 compliance documentation",
    "Prepare case studies for similar-sized implementations",
    "Follow up on integration complexity concerns with technical deep-dive",
  ],
  riskFlags: [
    "Security team not yet engaged - could delay timeline",
    "CFO concerns mentioned indirectly - may need executive alignment",
  ],
};

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1.5 pl-5 text-sm text-foreground">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

/** Recording of a finished call: player + AI headline first, the rest folded. */
export const CallRecordingPanel = ({ duration = "12:34" }: { duration?: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="space-y-3 p-4">
        {/* Player */}
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause recording" : "Play recording"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Recording</span>
              <span>{duration}</span>
            </div>
            <Progress value={100} className="h-1.5" />
          </div>
        </div>

        {/* AI headline */}
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="flex-1 text-sm font-medium text-foreground">{mockSummary.headline}</p>
          <Badge variant="outline" className={`shrink-0 border-transparent capitalize ${sentimentBadge(mockSummary.sentiment)}`}>
            {mockSummary.sentiment}
          </Badge>
        </div>
      </div>

      <div className="border-t border-border px-4">
        <Disclosure title="Takeaways & next steps" icon={ListChecks} summary={`${mockSummary.nextSteps.length} steps`}>
          <div className="space-y-3">
            <BulletList items={mockSummary.keyTakeaways} />
            <p className="text-xs font-medium text-muted-foreground">Suggested next steps</p>
            <BulletList items={mockSummary.nextSteps} />
          </div>
        </Disclosure>

        <Disclosure title="Risk flags" icon={AlertTriangle} summary={mockSummary.riskFlags.length}>
          <BulletList items={mockSummary.riskFlags} />
        </Disclosure>

        <Disclosure title="Key moments" icon={Bookmark} summary={mockKeyMoments.length}>
          <ul className="space-y-3">
            {mockKeyMoments.map((m) => (
              <li key={m.id} className="flex gap-3 text-sm">
                <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground pt-0.5">{m.timestamp}</span>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {m.speaker} · <span className={m.type === "risk" ? "text-danger" : ""}>{m.type}</span>
                  </p>
                  <p className="text-foreground">{m.content}</p>
                </div>
              </li>
            ))}
          </ul>
        </Disclosure>

        <Disclosure title="Transcript" icon={MessageSquare} summary={duration}>
          <ul className="space-y-3">
            {mockTranscript.map((entry) => (
              <li key={entry.id} className="flex gap-3 text-sm">
                <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground pt-0.5">{entry.timestamp}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">{entry.speaker}</p>
                  <p className="text-foreground">{entry.content}</p>
                </div>
              </li>
            ))}
          </ul>
        </Disclosure>
      </div>
    </div>
  );
};

export default CallRecordingPanel;
