import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Disclosure } from "@/components/ui/disclosure";
import { BarChart3, Users, History, Lightbulb } from "lucide-react";
import type { Stakeholder } from "@/data/dealData";
import { scoreText, trendText, categoryBadge } from "@/lib/tone";
import { ScoreDrivers } from "./DealSection";

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

const totalGaps = alignmentMatrixData.reduce((sum, row) => sum + row.gaps, 0);
const matrixColumns = [
  { key: "capability", label: "Cap." },
  { key: "messageFit", label: "Msg" },
  { key: "valueTranslation", label: "Value" },
] as const;
const gridColumns = [
  { key: "threatMitigation", label: "Threat" },
  { key: "costReduction", label: "Cost" },
  { key: "speedToValue", label: "Speed" },
  { key: "innovation", label: "Innov." },
  { key: "overall", label: "All" },
] as const;

const AlignmentIntelligenceModal = ({
  open,
  onOpenChange,
  companyName,
  overallScore,
  capabilityPct,
  messageFitPct,
  valueTranslationPct,
}: AlignmentIntelligenceModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="w-dialog max-w-3xl max-h-dialog p-0 gap-0 flex flex-col overflow-hidden max-sm:overflow-hidden">
      {/* Header: one line + meta */}
      <div className="p-4 sm:px-6 pr-12 border-b border-border shrink-0">
        <DialogTitle className="flex items-center gap-2 text-base">
          <Users className="w-4 h-4 text-primary" />
          Alignment
        </DialogTitle>
        <DialogDescription className="text-xs mt-1">
          {companyName} · {totalGaps} gaps across {alignmentMatrixData.length} value drivers
        </DialogDescription>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Score and its drivers */}
        <ScoreDrivers
          score={overallScore}
          drivers={[
            { label: "Capability", value: capabilityPct },
            { label: "Message fit", value: messageFitPct },
            { label: "Value translation", value: valueTranslationPct },
          ]}
        />

        {/* Everything else folded */}
        <div>
          <Disclosure title="What to fix" icon={Lightbulb} summary={`${notes.length} notes`}>
            <ul className="space-y-1.5 text-sm">
              {notes.map((note) => (
                <li key={note.driver}>
                  <span className="font-medium">{note.driver}:</span> <span className="text-muted-foreground">{note.note}</span>
                </li>
              ))}
            </ul>
          </Disclosure>

          <Disclosure title="Timeline" icon={History} summary={`${timelineEvents.length} events`}>
            <div className="divide-y divide-border">
              {timelineEvents.map((event) => (
                <div key={event.date} className="flex items-start gap-3 py-2 first:pt-0 last:pb-0 text-sm">
                  <div className="flex-1">
                    <p>{event.event}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className={`text-xs font-medium ${trendText(event.impact)}`}>
                    {event.impact > 0 ? "+" : ""}{event.impact}%
                  </span>
                </div>
              ))}
            </div>
          </Disclosure>

          <Disclosure title="Value driver matrix" icon={BarChart3} summary={`${totalGaps} gaps`}>
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                    <th className="text-left p-2 font-medium">Driver</th>
                    {matrixColumns.map((c) => (
                      <th key={c.key} className="text-center p-2 font-medium">{c.label}</th>
                    ))}
                    <th className="text-left p-2 font-medium">Execs</th>
                  </tr>
                </thead>
                <tbody>
                  {alignmentMatrixData.map((row) => (
                    <tr key={row.driver} className="border-b border-border last:border-0">
                      <td className="p-2">
                        <p className="font-medium text-foreground">{row.driver}</p>
                        {row.gaps > 0 && <p className="text-danger">{row.gaps} gap</p>}
                      </td>
                      {matrixColumns.map((c) => (
                        <td key={c.key} className={`p-2 text-center font-semibold ${scoreText(row[c.key])}`}>{row[c.key]}%</td>
                      ))}
                      <td className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {row.execs.map((exec) => (
                            <span key={exec.role} className={`px-1.5 py-0.5 rounded-full whitespace-nowrap ${categoryBadge}`}>
                              {exec.role} {exec.pct}%
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Disclosure>

          <Disclosure title="Stakeholders" icon={Users} summary={`${stakeholderGridData.length} people`}>
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                    <th className="text-left p-2 font-medium">Stakeholder</th>
                    {gridColumns.map((c) => (
                      <th key={c.key} className="text-center p-2 font-medium">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stakeholderGridData.map((sh) => (
                    <tr key={sh.name} className="border-b border-border last:border-0">
                      <td className="p-2">
                        <p className="font-medium text-foreground">{sh.name}</p>
                        <p className="text-muted-foreground">{sh.role}</p>
                      </td>
                      {gridColumns.map((c) => (
                        <td key={c.key} className={`p-2 text-center font-semibold ${scoreText(sh[c.key])}`}>{sh[c.key]}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Disclosure>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default AlignmentIntelligenceModal;
