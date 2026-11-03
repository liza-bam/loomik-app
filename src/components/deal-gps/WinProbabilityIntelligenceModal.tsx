import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Target,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Zap,
  MessageSquare,
  Activity,
  Mail,
  Phone,
  Video,
} from "lucide-react";
import type { Stakeholder } from "@/data/dealData";
import { scoreText, trendText, priorityDot, categoryBadge, selectedChip, unselectedChip } from "@/lib/tone";

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

const getStatusBadge = (value: number) => {
  if (value >= 75) return { label: "Aligned", color: "bg-success-subtle text-success" };
  if (value >= 50) return { label: "Partial", color: "bg-warning-subtle text-warning" };
  return { label: "At Risk", color: "bg-danger-subtle text-danger" };
};

// Hardcoded data for Consensus Heatmap
const consensusHeatmapData = [
  { name: "Michael Rodriguez", role: "VP Ops", cost: 84, technical: 78, timeline: 94, risk: 99, overall: 89 },
  { name: "Sarah Chen", role: "CTO", cost: 90, technical: 80, timeline: 77, risk: 86, overall: 83 },
  { name: "Lisa Wang", role: "CFO", cost: 65, technical: 96, timeline: 78, risk: 80, overall: 80 },
  { name: "David Thompson", role: "VP Sales", cost: 84, technical: 72, timeline: 67, risk: 95, overall: 80 },
  { name: "Alex Johnson", role: "VP Marketing", cost: 80, technical: 70, timeline: 68, risk: 66, overall: 71 },
];

// Hardcoded data for Areas of Agreement
const areasOfAgreement = [
  { topic: "Security Framework", supporters: ["CTO", "CISO", "Legal", "Dev Lead"], consensusLevel: 90, lastActivity: "3 hours ago" },
  { topic: "Deployment Model", supporters: ["CTO", "CEO", "Head of Sales"], consensusLevel: 78, lastActivity: "1 day ago" },
  { topic: "User Training Plan", supporters: ["HR", "Product Manager"], consensusLevel: 72, lastActivity: "2 days ago" },
];

// Hardcoded data for Areas of Division
const areasOfDivision = [
  { 
    topic: "Implementation Timeline", 
    division: "high",
    support: [{ icon: "thumbsUp", names: ["CTO", "Dev Lead", "Project Manager"] }],
    against: [{ icon: "thumbsDown", names: ["CFO"] }],
    neutral: [{ icon: "minus", names: ["CEO"] }],
    consensusProgress: 25,
    priority: "high",
    lastActivity: "2 hours ago"
  },
  { 
    topic: "Budget Allocation", 
    division: "medium",
    support: [{ icon: "thumbsUp", names: ["CEO", "Head of Sales"] }],
    against: [{ icon: "thumbsDown", names: ["CFO"] }],
    neutral: [{ icon: "minus", names: ["CTO", "Legal"] }],
    consensusProgress: 60,
    priority: "medium",
    lastActivity: "1 day ago"
  },
  { 
    topic: "Security Requirements", 
    division: "low",
    support: [{ icon: "thumbsUp", names: ["CTO", "CISO", "Legal"] }],
    against: [{ icon: "thumbsDown", names: ["CFO"] }],
    neutral: [],
    consensusProgress: 85,
    priority: "low",
    lastActivity: "3 hours ago"
  },
];

// Hardcoded data for Consensus Progress by Driver
const consensusProgressByDriver = [
  { 
    driver: "Technical Capabilities", 
    aligned: 6, 
    total: 7, 
    progress: 90, 
    note: "Full alignment by Friday",
    blockers: []
  },
  { 
    driver: "ROI & Cost Benefits", 
    aligned: 5, 
    total: 7, 
    progress: 75, 
    note: "Business case review Thursday",
    blockers: ["CFO concerns about upfront costs"]
  },
  { 
    driver: "Implementation Risk", 
    aligned: 3, 
    total: 7, 
    progress: 45, 
    note: "Risk mitigation plan due Monday",
    blockers: ["Timeline disagreement", "Resource allocation"]
  },
];

// Sentiment Tab Data
const sentimentTimelineData = [
  { month: "Jan", sentiment: 63 },
  { month: "Feb", sentiment: 64 },
  { month: "Mar", sentiment: 87 },
  { month: "Apr", sentiment: 95 },
  { month: "May", sentiment: 84 },
  { month: "Jun", sentiment: 85 },
];

const stakeholderEngagementData = [
  { name: "Sarah Chen", role: "CTO", engagement: 81, emailOpens: 82, callAttendance: 81, materialReview: 81, lastActivity: "14 hours ago", selected: true },
  { name: "Michael Rodriguez", role: "VP Ops", engagement: 91, emailOpens: 98, callAttendance: 86, materialReview: 88, lastActivity: "9 hours ago", selected: false },
  { name: "Lisa Wang", role: "CFO", engagement: 89, emailOpens: 85, callAttendance: 98, materialReview: 84, lastActivity: "13 hours ago", selected: false },
  { name: "David Thompson", role: "VP Sales", engagement: 83, emailOpens: 80, callAttendance: 87, materialReview: 82, lastActivity: "18 hours ago", selected: false },
  { name: "Alex Johnson", role: "VP Marketing", engagement: 84, emailOpens: 86, callAttendance: 92, materialReview: 73, lastActivity: "13 hours ago", selected: false },
];

const channelSentimentData = [
  { channel: "Email Sentiment", trend: 5, positive: 65, neutral: 25, negative: 10, total: 28, icon: Mail },
  { channel: "Meeting Sentiment", trend: 8, positive: 78, neutral: 18, negative: 4, total: 12, icon: Video },
  { channel: "Phone Calls", trend: -2, positive: 72, neutral: 22, negative: 6, total: 15, icon: Phone },
];

const selectedStakeholderDetails = {
  name: "Sarah Chen",
  role: "CTO",
  engagement: 89,
  sentiment: 65,
  riskLevel: "Medium Risk",
  lastContact: "22 hours ago",
  keyTopics: ["Supplier Risk", "ROI", "Integration"],
};

// Sentiment Tab Component
const SentimentTabContent = ({ sentimentPct }: { sentimentPct: number }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("6m");
  const [selectedStakeholder, setSelectedStakeholder] = useState(0);
  
  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Sentiment Intelligence</h3>
          <p className="text-xs text-muted-foreground">Real-time sentiment analysis and stakeholder mood tracking</p>
        </div>
        <div className="flex items-center gap-0.5">
          {["1m", "3m", "6m", "1y"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedPeriod === period ? selectedChip : unselectedChip
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Overall Sentiment</span>
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${scoreText(sentimentPct)}`}>{sentimentPct}%</span>
              <span className="text-xs text-success flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />+3%
              </span>
            </div>
          </div>
        </div>
        <div className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Engagement</span>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">82%</span>
              <span className="text-xs text-success flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />+5%
              </span>
            </div>
          </div>
        </div>
        <div className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Positive Sentiment</span>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">81%</span>
              <span className="text-xs text-success flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />+2%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click to view keywords</p>
          </div>
        </div>
        <div className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Negative Sentiment</span>
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">19%</span>
              <span className="text-xs text-success flex items-center gap-0.5">
                <TrendingDown className="w-3 h-3" />-1%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Click to view keywords</p>
          </div>
        </div>
      </div>

      {/* Stakeholder Engagement Details */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-primary-subtle">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Stakeholder Engagement Details</h3>
            <p className="text-xs text-muted-foreground">Email opens, call attendance, and material review tracking</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {stakeholderEngagementData.slice(0, 4).map((sh, idx) => (
            <div
              key={sh.name}
              onClick={() => setSelectedStakeholder(idx)}
              className={`group relative bg-card border rounded-lg p-4 cursor-pointer transition-colors
                ${selectedStakeholder === idx ? "border-primary" : "border-border hover:bg-muted/50"}`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="font-medium text-sm">{sh.name}</span>
                  <Badge variant="secondary" className="text-xs">Engagement {sh.engagement}%</Badge>
                  {selectedStakeholder === idx && (
                    <Badge variant="outline" className={`border-transparent text-xs ${selectedChip}`}>Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{sh.role}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email Opens:</span>
                    <span className={`font-medium ${scoreText(sh.emailOpens)}`}>{sh.emailOpens}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Call Attendance:</span>
                    <span className={`font-medium ${scoreText(sh.callAttendance)}`}>{sh.callAttendance}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material Review:</span>
                    <span className={`font-medium ${scoreText(sh.materialReview)}`}>{sh.materialReview}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Last activity: {sh.lastActivity}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Fifth stakeholder on separate row */}
        <div className="mt-3 max-w-[calc(25%-0.5rem)]">
          <div
            onClick={() => setSelectedStakeholder(4)}
            className={`group relative bg-card border rounded-lg p-4 cursor-pointer transition-colors
              ${selectedStakeholder === 4 ? "border-primary" : "border-border hover:bg-muted/50"}`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="font-medium text-sm">{stakeholderEngagementData[4].name}</span>
                <Badge variant="secondary" className="text-xs">Engagement {stakeholderEngagementData[4].engagement}%</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{stakeholderEngagementData[4].role}</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email Opens:</span>
                  <span className={`font-medium ${scoreText(stakeholderEngagementData[4].emailOpens)}`}>{stakeholderEngagementData[4].emailOpens}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Call Attendance:</span>
                  <span className={`font-medium ${scoreText(stakeholderEngagementData[4].callAttendance)}`}>{stakeholderEngagementData[4].callAttendance}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material Review:</span>
                  <span className={`font-medium ${scoreText(stakeholderEngagementData[4].materialReview)}`}>{stakeholderEngagementData[4].materialReview}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last activity: {stakeholderEngagementData[4].lastActivity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Timeline & Stakeholder Details */}
      <div className="bg-muted/20 rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Sentiment Timeline & Stakeholder Details</h3>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sentimentTimelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="sentiment" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: 'hsl(var(--chart-1))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Stakeholder Detail Card */}
        <div className="border border-border bg-card rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{selectedStakeholderDetails.name}</h4>
              <p className="text-sm text-muted-foreground">{selectedStakeholderDetails.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-medium ${scoreText(selectedStakeholderDetails.sentiment)}`}>Sentiment: {selectedStakeholderDetails.sentiment}</span>
              <Badge variant="outline" className="border-transparent bg-warning-subtle text-warning">{selectedStakeholderDetails.riskLevel}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Engagement</p>
              <p className={`text-lg font-semibold ${scoreText(selectedStakeholderDetails.engagement)}`}>{selectedStakeholderDetails.engagement}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Contact</p>
              <p className="text-sm">{selectedStakeholderDetails.lastContact}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Key Topics</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStakeholderDetails.keyTopics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Sentiment Cards */}
      <div className="grid grid-cols-3 gap-3">
        {channelSentimentData.map((channel) => {
          const IconComponent = channel.icon;
          return (
            <div 
              key={channel.channel} 
              className="group relative bg-card border border-border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50"
            >
              <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{channel.channel}</span>
                </div>
                <Badge variant="outline" className={`border-transparent text-xs ${channel.trend >= 0 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                  {channel.trend >= 0 ? "+" : ""}{channel.trend}%
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Positive</span>
                  <span className="text-foreground font-medium">{channel.positive}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Neutral</span>
                  <span className="text-foreground font-medium">{channel.neutral}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Negative</span>
                  <span className="text-foreground font-medium">{channel.negative}%</span>
                </div>
              </div>
                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border">Total Communications: {channel.total}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WinProbabilityIntelligenceModal = ({
  open,
  onOpenChange,
  companyName,
  overallScore,
  consensusPct,
  sentimentPct,
}: WinProbabilityIntelligenceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80vw] max-w-5xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header - Fixed */}
        <div className="px-5 py-3 pr-14 flex items-center gap-3 border-b border-border bg-muted/30 shrink-0">
          <div className="p-2 rounded-lg bg-primary-subtle">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Win Probability Intelligence - {companyName}</h2>
              <Badge variant="secondary">{overallScore}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Deep-dive into consensus tracking and sentiment analysis
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="consensus" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-5 mt-3 w-fit shrink-0">
            <TabsTrigger value="consensus" className="gap-1.5">
              <Users className="w-4 h-4" />
              Consensus
              <Badge variant="secondary" className="ml-1 text-xs">{consensusPct}%</Badge>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="gap-1.5">
              <Zap className="w-4 h-4" />
              Sentiment
              <Badge variant="secondary" className="ml-1 text-xs">{sentimentPct}%</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Consensus Tab */}
          <TabsContent value="consensus" className="flex-1 overflow-y-auto p-5 pb-4 space-y-6 m-0">
            {/* Consensus Heatmap */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold">Consensus Heatmap</h3>
                  <p className="text-xs text-muted-foreground">Visual representation of stakeholder consensus across key decision factors</p>
                </div>
              </div>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Stakeholder</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Cost</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Technical</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Timeline</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Risk</th>
                      <th className="text-center p-3 text-xs font-medium text-muted-foreground">Overall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consensusHeatmapData.map((row) => {
                      const status = getStatusBadge(row.overall);
                      return (
                        <tr key={row.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-foreground">{row.name}</p>
                              <p className="text-xs text-muted-foreground">{row.role}</p>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-semibold ${scoreText(row.cost)}`}>{row.cost}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-semibold ${scoreText(row.technical)}`}>{row.technical}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-semibold ${scoreText(row.timeline)}`}>{row.timeline}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-semibold ${scoreText(row.risk)}`}>{row.risk}%</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-base font-bold ${scoreText(row.overall)}`}>{row.overall}%</span>
                              <Badge variant="outline" className={`border-transparent text-xs ${status.color}`}>{status.label}</Badge>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consensus Building Tracker */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary-subtle">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Consensus Building Tracker</h3>
                  <p className="text-xs text-muted-foreground">Monitor stakeholder alignment and resolve conflicts</p>
                </div>
              </div>

              {/* Areas of Agreement */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">Areas of Agreement</span>
                  <Badge variant="outline" className="border-transparent bg-success-subtle text-success">{areasOfAgreement.length} Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {areasOfAgreement.map((area) => (
                    <div 
                      key={area.topic} 
                      className="group relative bg-card border border-border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{area.topic}</span>
                        <Badge variant="outline" className={`border-transparent text-xs ${categoryBadge}`}>agreement</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Support ({area.supporters.length}): {area.supporters.join(", ")}
                      </p>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Consensus Level</span>
                        <span className={`text-xs font-semibold ${scoreText(area.consensusLevel)}`}>{area.consensusLevel}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Last activity: {area.lastActivity}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Take Action <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas of Division */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Areas of Division</span>
                  <Badge variant="outline" className="border-transparent bg-warning-subtle text-warning">{areasOfDivision.length} Active</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {areasOfDivision.map((area) => (
                    <div 
                      key={area.topic} 
                      className="group relative bg-card border border-border rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{area.topic}</span>
                        <Badge variant="outline" className={`border-transparent text-xs ${categoryBadge}`}>{area.division} division</Badge>
                      </div>
                      
                      {/* Support/Against/Neutral */}
                      <div className="flex gap-3 mb-2 text-xs">
                        <div>
                          <span className="text-foreground font-medium">Support ({area.support[0]?.names.length || 0})</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <ThumbsUp className="w-3 h-3 text-success" />
                            <span className="text-muted-foreground">{area.support[0]?.names.slice(0, 2).join(", ")}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-foreground font-medium">Against ({area.against[0]?.names.length || 0})</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <ThumbsDown className="w-3 h-3 text-danger" />
                            <span className="text-muted-foreground">{area.against[0]?.names.join(", ")}</span>
                          </div>
                        </div>
                        {area.neutral.length > 0 && (
                          <div>
                            <span className="text-muted-foreground font-medium">Neutral ({area.neutral[0]?.names.length || 0})</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Minus className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{area.neutral[0]?.names.join(", ")}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Consensus Progress</span>
                        <span className={`text-xs font-semibold ${scoreText(area.consensusProgress)}`}>{area.consensusProgress}%</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Last activity: {area.lastActivity}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(area.priority)}`} />
                            {area.priority} priority
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          Take Action <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Consensus Progress by Driver */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Consensus Progress by Driver</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {consensusProgressByDriver.map((driver) => (
                  <div 
                    key={driver.driver} 
                    className="group relative bg-muted/20 rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">{driver.driver}</h4>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{driver.aligned}/{driver.total} aligned</span>
                        {driver.progress >= 70 ? (
                          <TrendingUp className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className={`text-xs font-semibold ${scoreText(driver.progress)}`}>{driver.progress}%</span>
                    </div>

                    {driver.blockers.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-danger mb-1">Key Blockers:</p>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          {driver.blockers.map((blocker, idx) => (
                            <li key={idx}>• {blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{driver.note}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Banner */}
            <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary-subtle">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Consensus Action Required</h4>
                  <p className="text-sm text-muted-foreground">3 critical decisions need stakeholder alignment this week</p>
                </div>
              </div>
              <Button>
                <ArrowRight className="w-4 h-4 mr-2" />
                Create Action Plan
              </Button>
            </div>
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment" className="flex-1 overflow-y-auto p-5 pb-4 m-0 space-y-6">
            <SentimentTabContent sentimentPct={sentimentPct} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WinProbabilityIntelligenceModal;
