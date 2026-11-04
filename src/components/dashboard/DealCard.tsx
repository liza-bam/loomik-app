import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getCompanyById, stageConfig, formatCompactValue } from "@/data/dealData";
import { scoreFill, scoreText } from "@/lib/tone";

// Format date as MM.DD.YY
const formatCompactDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
};

interface Deal {
  id: number;
  name: string;
  companyId: number;
  stage: "diagnose" | "validate" | "align" | "commit";
  valueNumeric: number;
  closeDate: string;
  winProbability: number;
  alignment: number;
  hasRisk: boolean;
}

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
  const navigate = useNavigate();
  const company = getCompanyById(deal.companyId);
  const stageInfo = stageConfig[deal.stage];

  const handleCardClick = () => navigate(`/deal-gps?deal=${deal.id}`);

  return (
    <Card className="p-4 interactive-card cursor-pointer space-y-3" onClick={handleCardClick}>
      {/* Who: logo, deal, company + close date, stage */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={company?.logo} alt={company?.name} className="object-contain p-1" />
          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
            {company?.name.slice(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="flex items-center gap-1.5 font-medium text-foreground text-sm">
            <span className="truncate">{deal.name}</span>
            {deal.hasRisk && <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-danger" title="At risk" />}
          </p>
          <p className="text-xs text-muted-foreground truncate">{company?.name} · Closes {formatCompactDate(deal.closeDate)}</p>
        </div>
        <div className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xxs font-medium border ${stageInfo.colorClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dotColor}`} />
          {stageInfo.label}
        </div>
      </div>

      {/* Value, win, alignment */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div>
          <p className="text-xxs text-muted-foreground">Value</p>
          <p className="text-sm font-semibold text-foreground">{formatCompactValue(deal.valueNumeric)}</p>
        </div>
        {([["Win", deal.winProbability], ["Alignment", deal.alignment]] as const).map(([label, value]) => (
          <div key={label}>
            <p className="text-xxs text-muted-foreground">{label}</p>
            <p className={`text-sm font-semibold ${scoreText(value)}`}>{value}%</p>
            <div className="h-1 mt-1 rounded-full bg-muted">
              <div className={`h-1 rounded-full ${scoreFill(value)}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DealCard;
