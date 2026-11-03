import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Target, BarChart3, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { Stakeholder } from "@/data/dealData";
import { scoreText, scoreFill, scoreColor, trendText, sentimentBadge, categoryBadge } from "@/lib/tone";

interface AlignmentIntelligenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  stakeholders: Stakeholder[];
  overallScore: number;
  capabilityPct: number;
  messageFitPct: number;
  valueTranslationPct: number;
}

// Hardcoded timeline data from screenshots
const timelineEvents = [
  { date: "4/1/2024", event: "Kickoff meeting - Initial value props resonated with CTO", impact: +8 },
  { date: "4/9/2024", event: "Security workshop - CISO aligned after control mapping", impact: +12 },
  { date: "4/17/2024", event: "ROI review - Finance approved cost model", impact: +6 },
  { date: "4/23/2024", event: "Executive sync - Timeline concern raised by COO", impact: -3 },
];

// Hardcoded alignment matrix data from screenshots
const alignmentMatrixData = [
  { driver: "Cost Efficiency", capability: 88, messageFit: 64, valueTranslation: 73, gaps: 0, execs: [{ role: "CEO", pct: 95 }, { role: "CFO", pct: 87 }] },
  { driver: "Risk Mitigation", capability: 82, messageFit: 54, valueTranslation: 66, gaps: 1, execs: [{ role: "CISO", pct: 92 }, { role: "CIO", pct: 86 }] },
  { driver: "Revenue Growth", capability: 74, messageFit: 69, valueTranslation: 93, gaps: 0, execs: [{ role: "CEO", pct: 95 }, { role: "CRO", pct: 91 }] },
  { driver: "Time-to-Outcome", capability: 63, messageFit: 78, valueTranslation: 124, gaps: 0, execs: [{ role: "COO", pct: 90 }] },
  { driver: "Operational Productivity", capability: 71, messageFit: 45, valueTranslation: 63, gaps: 1, execs: [{ role: "COO", pct: 88 }] },
];

// Hardcoded notes from screenshots
const notes = [
  { driver: "Cost Efficiency", note: "Under-communicated; attach ROI proof" },
  { driver: "Risk Mitigation", note: "Missing compliance proof asset" },
  { driver: "Revenue Growth", note: "Healthy balance; keep emphasis" },
  { driver: "Time-to-Outcome", note: "Over-communicated; rebalance toward Cost Efficiency" },
  { driver: "Operational Productivity", note: "Promote proven throughput gains" },
];

// Hardcoded stakeholder grid data from screenshots
const stakeholderGridData = [
  { name: "Sarah Chen", role: "CTO", threatMitigation: 68, costReduction: 72, speedToValue: 58, innovation: 48, overall: 62, status: "Partial" },
  { name: "Michael Rodriguez", role: "VP Ops", threatMitigation: 42, costReduction: 59, speedToValue: 76, innovation: 41, overall: 55, status: "Partial" },
  { name: "Lisa Wang", role: "CFO", threatMitigation: 76, costReduction: 65, speedToValue: 69, innovation: 46, overall: 64, status: "Partial" },
  { name: "David Thompson", role: "Procurement", threatMitigation: 77, costReduction: 45, speedToValue: 44, innovation: 41, overall: 52, status: "Partial" },
  { name: "Emma Davis", role: "VP Engineering", threatMitigation: 64, costReduction: 79, speedToValue: 78, innovation: 95, overall: 79, status: "Aligned" },
];

const AlignmentIntelligenceModal = ({
  open,
  onOpenChange,
  companyName,
  overallScore,
  capabilityPct,
  messageFitPct,
  valueTranslationPct,
}: AlignmentIntelligenceModalProps) => {
  const pieData = [
    { name: "Score", value: overallScore },
    { name: "Remaining", value: 100 - overallScore },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-dialog max-w-5xl max-h-dialog overflow-hidden p-0 flex flex-col">
        {/* Header - Fixed */}
        <div className="px-5 py-3 pr-14 flex items-center gap-3 border-b border-border bg-muted/30 shrink-0">
          <div className="p-2 rounded-lg bg-primary-subtle">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">Alignment Intelligence - {companyName}</h2>
              <Badge variant="secondary">{overallScore}%</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Comprehensive alignment analysis including capability alignment, message fit, and value translation
            </p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="p-5 pb-4 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Two Columns - Score + Timeline */}
          <div className="grid grid-cols-2 gap-5">
            {/* Left - Alignment Score */}
            <div className="bg-muted/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Alignment Score</h3>
              <div className="flex items-center gap-5">
                {/* Donut */}
                <div className="relative w-24 h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill={scoreColor(overallScore)} />
                        <Cell fill="hsl(var(--muted))" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-bold ${scoreText(overallScore)}`}>{overallScore}%</span>
                  </div>
                </div>
                {/* Metric Bars */}
                <div className="flex-1 space-y-2.5">
                  {[
                    { label: "Capability Alignment", value: capabilityPct },
                    { label: "Message Fit", value: messageFitPct },
                    { label: "Value Translation", value: valueTranslationPct },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className={`text-xs font-semibold ${scoreText(m.value)}`}>{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - Alignment Timeline */}
            <div className="bg-muted/10 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Alignment Timeline</h3>
              <div className="space-y-1">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg transition-colors hover:bg-muted/50">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        event.impact > 0 ? "bg-success" : "bg-danger"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{event.date}</span>
                        <span className={`text-xs font-medium ${trendText(event.impact)}`}>
                          {event.impact > 0 ? (
                            <span className="flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" />+{event.impact}%
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5">
                              <TrendingDown className="w-3 h-3" />{event.impact}%
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-foreground truncate">{event.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Alignment Matrix Table */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Alignment Matrix</h3>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Buyer Value Driver</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Capability %</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Msg Fit %</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Value Trans %</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Gaps</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Exec Goal Alignment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alignmentMatrixData.map((row) => (
                    <TableRow key={row.driver}>
                      <TableCell className="text-sm font-medium">{row.driver}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(row.capability)}`} style={{ width: `${row.capability}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${scoreText(row.capability)}`}>{row.capability}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(row.messageFit)}`} style={{ width: `${Math.min(row.messageFit, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${scoreText(row.messageFit)}`}>{row.messageFit}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(row.valueTranslation)}`} style={{ width: `${Math.min(row.valueTranslation, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${scoreText(row.valueTranslation)}`}>{row.valueTranslation}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-xs font-medium ${row.gaps > 0 ? "text-danger" : "text-muted-foreground"}`}>
                          {row.gaps} gap{row.gaps !== 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {row.execs.map((exec) => (
                            <span
                              key={exec.role}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${categoryBadge}`}
                            >
                              {exec.role} {exec.pct}%
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Section 3: Notes */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Notes</h3>
            <ul className="space-y-1.5">
              {notes.map((note) => (
                <li key={note.driver} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <span className="font-medium">{note.driver}:</span>{" "}
                    <span className="text-muted-foreground">{note.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Stakeholder Alignment Grid */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Stakeholder Alignment Grid</h3>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Stakeholder</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground">Role</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Threat Mitigation</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Cost Reduction</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Speed to Value</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Innovation</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Overall</TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stakeholderGridData.map((sh) => (
                    <TableRow key={sh.name}>
                      <TableCell className="text-sm font-medium">{sh.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sh.role}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(sh.threatMitigation)}`} style={{ width: `${sh.threatMitigation}%` }} />
                          </div>
                          <span className={`text-xs ${scoreText(sh.threatMitigation)}`}>{sh.threatMitigation}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(sh.costReduction)}`} style={{ width: `${sh.costReduction}%` }} />
                          </div>
                          <span className={`text-xs ${scoreText(sh.costReduction)}`}>{sh.costReduction}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(sh.speedToValue)}`} style={{ width: `${sh.speedToValue}%` }} />
                          </div>
                          <span className={`text-xs ${scoreText(sh.speedToValue)}`}>{sh.speedToValue}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreFill(sh.innovation)}`} style={{ width: `${sh.innovation}%` }} />
                          </div>
                          <span className={`text-xs ${scoreText(sh.innovation)}`}>{sh.innovation}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-semibold ${scoreText(sh.overall)}`}>{sh.overall}%</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {sh.status === "Aligned" ? (
                          <Badge variant="outline" className={`border-transparent ${sentimentBadge("positive")}`}>Aligned</Badge>
                        ) : (
                          <Badge variant="outline" className="border-transparent bg-warning-subtle text-warning">Partial</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlignmentIntelligenceModal;
