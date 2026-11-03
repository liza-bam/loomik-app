import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { deals, stageConfig, getCompanyById, formatCompactValue, pipelineSummary, type DealStage } from "@/data/dealData";
import { trendText } from "@/lib/tone";

const total = deals.reduce((sum, d) => sum + d.valueNumeric, 0);
const bestDeal = deals.reduce((best, d) => (d.valueNumeric > best.valueNumeric ? d : best));
const byStage = (Object.keys(stageConfig) as DealStage[]).map((stage) => {
  const value = deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + d.valueNumeric, 0);
  return { stage, value, share: Math.round((value / total) * 100) };
});

// On the highlighted card the delta uses the card text colour (red/green can't be guaranteed contrast on every skin's accent)
const Delta = ({ value, onAccent = false }: { value: number; onAccent?: boolean }) => (
  <span className={`text-xs font-semibold ${onAccent ? "text-foreground" : trendText(value)}`}>
    {value > 0 ? "↑" : "↓"}
    {Math.abs(value)}%
  </span>
);

// Dashboard summary: pipeline total, key scores, best deal and value by stage.
const PipelineHero = () => {
  const { winRate, winRateChange, alignment, alignmentChange } = pipelineSummary;
  const company = getCompanyById(bestDeal.companyId);

  return (
    <section className="mb-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Pipeline value</p>
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tight text-foreground">{formatCompactValue(total)}</span>
            <span className="text-sm text-muted-foreground">{deals.length} open deals</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="rounded-lg bg-primary-subtle p-4 sm:min-w-35">
            <p className="text-xs text-foreground">Win rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{winRate}%</span>
              <Delta value={winRateChange} onAccent />
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border p-4 sm:min-w-35">
            <p className="text-xs text-muted-foreground">Alignment</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{alignment}%</span>
              <Delta value={alignmentChange} />
            </div>
          </div>
          <Link
            to={`/deal-gps?deal=${bestDeal.id}`}
            className="group rounded-lg bg-foreground text-background p-4 sm:min-w-40 transition-opacity hover:opacity-90"
          >
            <p className="flex items-center justify-between text-xs opacity-70">
              Best deal
              <ArrowUpRight className="w-3.5 h-3.5" />
            </p>
            <p className="text-2xl font-bold">{formatCompactValue(bestDeal.valueNumeric)}</p>
            <p className="text-xs opacity-70 truncate">{company?.name}</p>
          </Link>
        </div>
      </div>

      {/* Value by stage */}
      <div className="flex flex-wrap gap-2">
        {byStage.map(({ stage, value, share }) => (
          <div key={stage} className="flex flex-1 min-w-35 items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 text-sm">
            <span className={`w-2 h-2 rounded-full ${stageConfig[stage].dotColor}`} />
            <span className="text-muted-foreground">{stageConfig[stage].label}</span>
            <span className="ml-auto font-semibold text-foreground">{value ? formatCompactValue(value) : "—"}</span>
            {value > 0 && <span className="text-xs text-muted-foreground">{share}%</span>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PipelineHero;
