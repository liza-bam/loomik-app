import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { Target, Users, CheckCircle, AlertTriangle, ArrowRight, Clock, ThumbsUp, ThumbsDown, MessageSquare, Activity, Mail, Phone, Video } from "lucide-react";
import type { Stakeholder } from "@/data/dealData";
import { scoreText, trendText, priorityDot, chartTooltip, chartTick } from "@/lib/tone";
import { ScoreDrivers } from "./DealSection";

interface WinProbabilityIntelligenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  stakeholders: Stakeholder[];
  overallScore: number;
  alignmentPct: number;
  consensusPct: number;
  sentimentPct: number;
}

// Hardcoded data for Consensus Heatmap
const consensusHeatmapData = [
  { name: "Michael Rodriguez", role: "VP Ops", cost: 84, technical: 78, timeline: 94, risk: 99, overall: 89 },
  { name: "Sarah Chen", role: "CTO", cost: 90, technical: 80, timeline: 77, risk: 86, overall: 83 },
  { name: "Lisa Wang", role: "CFO", cost: 65, technical: 96, timeline: 78, risk: 80, overall: 80 },
  { name: "David Thompson", role: "VP Sales", cost: 84, technical: 72, timeline: 67, risk: 95, overall: 80 },
  { name: "Alex Johnson", role: "VP Marketing", cost: 80, technical: 70, timeline: 68, risk: 66, overall: 71 },
];
const heatmapColumns = [
  { key: "cost", label: "Cost" },
  { key: "technical", label: "Tech" },
  { key: "timeline", label: "Time" },
  { key: "risk", label: "Risk" },
  { key: "overall", label: "All" },
] as const;

const areasOfAgreement = [
  { topic: "Security Framework", supporters: ["CTO", "CISO", "Legal", "Dev Lead"], consensusLevel: 90, lastActivity: "3 hours ago" },
  { topic: "Deployment Model", supporters: ["CTO", "CEO", "Head of Sales"], consensusLevel: 78, lastActivity: "1 day ago" },
  { topic: "User Training Plan", supporters: ["HR", "Product Manager"], consensusLevel: 72, lastActivity: "2 days ago" },
];

const areasOfDivision = [
  { topic: "Implementation Timeline", support: ["CTO", "Dev Lead", "Project Manager"], against: ["CFO"], consensusProgress: 25, priority: "high", lastActivity: "2 hours ago" },
  { topic: "Budget Allocation", support: ["CEO", "Head of Sales"], against: ["CFO"], consensusProgress: 60, priority: "medium", lastActivity: "1 day ago" },
  { topic: "Security Requirements", support: ["CTO", "CISO", "Legal"], against: ["CFO"], consensusProgress: 85, priority: "low", lastActivity: "3 hours ago" },
];

const consensusProgressByDriver = [
  { driver: "Technical Capabilities", aligned: 6, total: 7, progress: 90, note: "Full alignment by Friday", blockers: [] as string[] },
  { driver: "ROI & Cost Benefits", aligned: 5, total: 7, progress: 75, note: "Business case review Thursday", blockers: ["CFO concerns about upfront costs"] },
  { driver: "Implementation Risk", aligned: 3, total: 7, progress: 45, note: "Risk mitigation plan due Monday", blockers: ["Timeline disagreement", "Resource allocation"] },
];

const sentimentTimelineData = [
  { month: "Jan", sentiment: 63 },
  { month: "Feb", sentiment: 64 },
  { month: "Mar", sentiment: 87 },
  { month: "Apr", sentiment: 95 },
  { month: "May", sentiment: 84 },
  { month: "Jun", sentiment: 85 },
];

const channelSentimentData = [
  { channel: "Email", trend: 5, positive: 65, negative: 10, total: 28, icon: Mail },
  { channel: "Meetings", trend: 8, positive: 78, negative: 4, total: 12, icon: Video },
  { channel: "Calls", trend: -2, positive: 72, negative: 6, total: 15, icon: Phone },
];

const stakeholderEngagementData = [
  { name: "Michael Rodriguez", role: "VP Ops", engagement: 91, emailOpens: 98, callAttendance: 86, materialReview: 88, lastActivity: "9 hours ago" },
  { name: "Lisa Wang", role: "CFO", engagement: 89, emailOpens: 85, callAttendance: 98, materialReview: 84, lastActivity: "13 hours ago" },
  { name: "Alex Johnson", role: "VP Marketing", engagement: 84, emailOpens: 86, callAttendance: 92, materialReview: 73, lastActivity: "13 hours ago" },
  { name: "David Thompson", role: "VP Sales", engagement: 83, emailOpens: 80, callAttendance: 87, materialReview: 82, lastActivity: "18 hours ago" },
  { name: "Sarah Chen", role: "CTO", engagement: 81, emailOpens: 82, callAttendance: 81, materialReview: 81, lastActivity: "14 hours ago" },
];

const blockedDrivers = consensusProgressByDriver.filter((d) => d.blockers.length > 0).length;

const WinProbabilityIntelligenceModal = ({
  open,
  onOpenChange,
  companyName,
  overallScore,
  alignmentPct,
  consensusPct,
  sentimentPct,
}: WinProbabilityIntelligenceModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-dialog max-w-3xl max-h-dialog p-0 gap-0 flex flex-col overflow-hidden max-sm:overflow-hidden">
      {/* Header: one line + meta */}
      <div className="p-4 sm:px-6 pr-12 border-b border-border shrink-0">
        <DialogTitle className="flex items-center gap-2 text-base">
          <Target className="w-4 h-4 text-primary" />
          Win probability
        </DialogTitle>
        <DialogDescription className="text-xs mt-1">
          {companyName} · {areasOfDivision.length} decisions need alignment this week
        </DialogDescription>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Score and its drivers */}
        <ScoreDrivers
          score={overallScore}
          drivers={[
            { label: "Alignment", value: alignmentPct },
            { label: "Consensus", value: consensusPct },
            { label: "Sentiment", value: sentimentPct },
          ]}
        />

        {/* Everything else folded */}
        <div>
          <Disclosure title="Areas of division" icon={AlertTriangle} summary={`${areasOfDivision.length} open`}>
            <div className="space-y-2">
              {areasOfDivision.map((area) => (
                <div key={area.topic} className="rounded-lg border border-border p-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(area.priority)}`} title={`${area.priority} priority`} />
                    <span className="flex-1 text-sm font-medium">{area.topic}</span>
                    <span className={`text-xs font-semibold ${scoreText(area.consensusProgress)}`}>{area.consensusProgress}%</span>
                  </div>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-success" />{area.support.join(", ")}</span>
                    <span className="inline-flex items-center gap-1"><ThumbsDown className="w-3 h-3 text-danger" />{area.against.join(", ")}</span>
                    <span>{area.lastActivity}</span>
                  </p>
                </div>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Areas of agreement" icon={CheckCircle} summary={`${areasOfAgreement.length} topics`}>
            <div className="divide-y divide-border">
              {areasOfAgreement.map((area) => (
                <div key={area.topic} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{area.topic}</span>
                    <span className={`text-xs font-semibold ${scoreText(area.consensusLevel)}`}>{area.consensusLevel}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{area.supporters.join(", ")} · {area.lastActivity}</p>
                </div>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Progress by driver" icon={Target} summary={`${blockedDrivers} blocked`}>
            <div className="divide-y divide-border">
              {consensusProgressByDriver.map((driver) => (
                <div key={driver.driver} className="py-2 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{driver.driver}</span>
                    <span className={`text-xs font-semibold ${scoreText(driver.progress)}`}>{driver.progress}%</span>
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {driver.aligned}/{driver.total} aligned · {driver.note}
                  </p>
                  {driver.blockers.length > 0 && <p className="text-xs text-danger">Blocked by: {driver.blockers.join(", ")}</p>}
                </div>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Consensus by stakeholder" icon={Users} summary={`${consensusHeatmapData.length} people`}>
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                    <th className="text-left p-2 font-medium">Stakeholder</th>
                    {heatmapColumns.map((c) => (
                      <th key={c.key} className="text-center p-2 font-medium">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consensusHeatmapData.map((row) => (
                    <tr key={row.name} className="border-b border-border last:border-0">
                      <td className="p-2">
                        <p className="font-medium text-foreground">{row.name}</p>
                        <p className="text-muted-foreground">{row.role}</p>
                      </td>
                      {heatmapColumns.map((c) => (
                        <td key={c.key} className={`p-2 text-center font-semibold ${scoreText(row[c.key])}`}>{row[c.key]}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Disclosure>

          <Disclosure title="Sentiment" icon={MessageSquare} summary={`${sentimentPct}%`}>
            <div className="space-y-3">
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="month" tick={chartTick} tickLine={false} axisLine={false} />
                    <YAxis domain={[50, 100]} tick={chartTick} tickLine={false} axisLine={false} width={28} />
                    <RechartsTooltip contentStyle={chartTooltip} />
                    <Line type="monotone" dataKey="sentiment" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-1))", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="divide-y divide-border">
                {channelSentimentData.map(({ channel, icon: Icon, trend, positive, negative, total }) => (
                  <div key={channel} className="flex items-center gap-2 py-2 text-sm">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{channel} <span className="text-xs text-muted-foreground">· {total}</span></span>
                    <span className="text-xs text-muted-foreground">{positive}% positive · {negative}% negative</span>
                    <span className={`w-8 text-right text-xs font-medium ${trendText(trend)}`}>{trend > 0 ? "+" : ""}{trend}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Disclosure>

          <Disclosure title="Engagement" icon={Activity} summary={`${stakeholderEngagementData.length} people`}>
            <div className="divide-y divide-border">
              {stakeholderEngagementData.map((sh) => (
                <div key={sh.name} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between text-sm">
                    <span><span className="font-medium">{sh.name}</span> <span className="text-xs text-muted-foreground">{sh.role}</span></span>
                    <span className={`text-xs font-semibold ${scoreText(sh.engagement)}`}>{sh.engagement}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Emails {sh.emailOpens}% · Calls {sh.callAttendance}% · Materials {sh.materialReview}% · {sh.lastActivity}
                  </p>
                </div>
              ))}
            </div>
          </Disclosure>
        </div>
      </div>

      {/* Sticky footer: one primary action */}
      <div className="p-4 sm:px-6 border-t border-border shrink-0 flex justify-end">
        <Button className="w-full sm:w-auto">
          Create action plan
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default WinProbabilityIntelligenceModal;
