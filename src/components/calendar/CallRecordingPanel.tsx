import { useState } from "react";
import { Play, Pause, Volume2, Clock, MessageSquare, Lightbulb, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  isClient: boolean;
  content: string;
}

// Mock transcript data
const mockTranscript: TranscriptEntry[] = [
  { id: 1, timestamp: "00:00", speaker: "Ryan Anderson", isClient: false, content: "Thanks for joining today. Let's dive into the implementation timeline." },
  { id: 2, timestamp: "00:45", speaker: "Sarah Chen", isClient: true, content: "We've been reviewing the proposal internally. The team is excited but we have some concerns about the integration complexity." },
  { id: 3, timestamp: "01:30", speaker: "Ryan Anderson", isClient: false, content: "Absolutely, let me walk you through our phased approach. We've done similar integrations with companies of your size." },
  { id: 4, timestamp: "02:15", speaker: "Michael Park", isClient: true, content: "What's the typical timeline for the data migration piece specifically?" },
  { id: 5, timestamp: "03:00", speaker: "Mike Johnson", isClient: false, content: "For your data volume, we're looking at 2-3 weeks for full migration with minimal downtime." },
  { id: 6, timestamp: "04:30", speaker: "Sarah Chen", isClient: true, content: "That's better than we expected. The CFO was concerned about a 6-week disruption we heard from another vendor." },
  { id: 7, timestamp: "05:15", speaker: "Ryan Anderson", isClient: false, content: "We can definitely beat that. Let me share some case studies from similar implementations." },
  { id: 8, timestamp: "06:00", speaker: "Michael Park", isClient: true, content: "Before we proceed, I need to loop in our security team. They'll want to review the SOC 2 compliance docs." },
  { id: 9, timestamp: "07:30", speaker: "Ryan Anderson", isClient: false, content: "Happy to schedule a dedicated security review call. We can have our CISO join as well." },
  { id: 10, timestamp: "08:15", speaker: "Sarah Chen", isClient: true, content: "That would be great. Let's aim for next week. I think we're moving in the right direction here." },
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

const getMomentIcon = (type: KeyMoment["type"]) => {
  switch (type) {
    case "insight": return <Lightbulb className="w-3.5 h-3.5 text-yellow" />;
    case "risk": return <AlertTriangle className="w-3.5 h-3.5 text-red" />;
    case "action": return <CheckCircle2 className="w-3.5 h-3.5 text-green" />;
    case "question": return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
  }
};

const getMomentBadgeClass = (type: KeyMoment["type"]) => {
  switch (type) {
    case "insight": return "bg-yellow/10 text-yellow border-yellow/20";
    case "risk": return "bg-red/10 text-red border-red/20";
    case "action": return "bg-green/10 text-green border-green/20";
    case "question": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  }
};

interface CallRecordingPanelProps {
  eventTitle: string;
  duration?: string;
}

export const CallRecordingPanel = ({ eventTitle, duration = "12:34" }: CallRecordingPanelProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  // Start at 100% - call just ended
  const [playbackProgress, setPlaybackProgress] = useState(100);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Loomik Recording Header */}
      <div className="bg-gradient-to-r from-purple/10 to-primary/10 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple to-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground text-sm">Loomik Recording</h3>
                <Badge variant="outline" className="bg-purple/10 text-purple border-purple/20 text-xs animate-pulse">
                  Just Ended
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{eventTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{duration}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </Button>
          <div className="flex-1">
            <Progress value={playbackProgress} className="h-1.5" />
          </div>
          <span className="text-xs text-muted-foreground font-mono">{duration} / {duration}</span>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
            <Volume2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs for Transcript, Key Moments, Summary */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-10 px-4">
          <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple rounded-none">
            AI Summary
          </TabsTrigger>
          <TabsTrigger value="moments" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple rounded-none">
            Key Moments ({mockKeyMoments.length})
          </TabsTrigger>
          <TabsTrigger value="transcript" className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple rounded-none">
            Transcript
          </TabsTrigger>
        </TabsList>

        {/* AI Summary Tab */}
        <TabsContent value="summary" className="m-0 p-4">
          <div className="space-y-4">
            {/* Headline */}
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground">{mockSummary.headline}</p>
                <Badge variant="outline" className={`mt-1 text-xs ${
                  mockSummary.sentiment === "positive" ? "bg-green/10 text-green border-green/20" :
                  mockSummary.sentiment === "negative" ? "bg-red/10 text-red border-red/20" :
                  "bg-yellow/10 text-yellow border-yellow/20"
                }`}>
                  {mockSummary.sentiment} sentiment
                </Badge>
              </div>
            </div>

            {/* Key Takeaways */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Key Takeaways</p>
              <ul className="space-y-1.5">
                {mockSummary.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-purple mt-1">•</span>
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Suggested Next Steps</p>
              <ul className="space-y-1.5">
                {mockSummary.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green mt-0.5 shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Flags */}
            {mockSummary.riskFlags.length > 0 && (
              <div className="bg-red/5 border border-red/20 rounded-lg p-3">
                <p className="text-xs font-medium text-red uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Risk Flags
                </p>
                <ul className="space-y-1">
                  {mockSummary.riskFlags.map((risk, idx) => (
                    <li key={idx} className="text-sm text-foreground">{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Key Moments Tab */}
        <TabsContent value="moments" className="m-0">
          <ScrollArea className="h-[280px]">
            <div className="p-4 space-y-3">
              {mockKeyMoments.map((moment) => (
                <div 
                  key={moment.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    {getMomentIcon(moment.type)}
                    <span className="text-xs font-mono text-muted-foreground">{moment.timestamp}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground">{moment.speaker}</span>
                      <Badge variant="outline" className={`text-xxs ${getMomentBadgeClass(moment.type)}`}>
                        {moment.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{moment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript" className="m-0">
          <ScrollArea className="h-[280px]">
            <div className="p-4 space-y-3">
              {mockTranscript.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3">
                  <span className="text-xs font-mono text-muted-foreground shrink-0 w-10">{entry.timestamp}</span>
                  <div className={`flex-1 p-2.5 rounded-lg ${
                    entry.isClient 
                      ? "bg-green/5 border border-green/20" 
                      : "bg-purple/5 border border-purple/20"
                  }`}>
                    <p className={`text-xs font-medium mb-1 ${entry.isClient ? "text-green" : "text-purple"}`}>
                      {entry.speaker}
                    </p>
                    <p className="text-sm text-foreground">{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CallRecordingPanel;
