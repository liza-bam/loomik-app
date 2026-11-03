import { Zap, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getCompanyById, stageConfig } from "@/data/dealData";
import { scoreFill, scoreText } from "@/lib/tone";

// Format value as compact currency ($580K, $2.4M)
const formatCompactValue = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`.replace('.0M', 'M');
  }
  return `$${Math.round(value / 1000)}K`;
};

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

  const handleCardClick = () => {
    navigate(`/deal-gps?deal=${deal.id}`);
  };

  return (
    <Card 
      className="group p-4 interactive-card flex flex-col relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Header: Logo + Deal Info */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={company?.logo} alt={company?.name} className="object-contain p-1" />
          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
            {company?.name.slice(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm line-clamp-1">{deal.name}</p>
          <p className="text-xs text-muted-foreground truncate">{company?.name}</p>
        </div>
        <div className={`shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xxs font-medium border ${stageInfo.colorClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dotColor}`} />
          {stageInfo.label}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
        <div>
          <p className="text-xxs text-muted-foreground uppercase tracking-wide mb-0.5">Value</p>
          <p className="text-sm font-semibold text-foreground">{formatCompactValue(deal.valueNumeric)}</p>
        </div>
        <div>
          <p className="text-xxs text-muted-foreground uppercase tracking-wide mb-0.5">Close By</p>
          <p className="text-sm font-semibold text-foreground">{formatCompactDate(deal.closeDate)}</p>
        </div>
        {([["Win", deal.winProbability], ["Alignment", deal.alignment]] as const).map(([label, value]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xxs text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className={`text-sm font-semibold ${scoreText(value)}`}>{value}%</p>
            </div>
            <div className="h-1 rounded-full bg-muted">
              <div className={`h-1 rounded-full ${scoreFill(value)}`} style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
        <div className="relative">
          <Button
            size="sm"
            onClick={(e) => { 
              e.stopPropagation(); 
              navigate(`/action-hub?company=${encodeURIComponent(company?.name || "")}`); 
            }}
            title="Actions"
          >
            <Zap className="w-4 h-4" />
            Actions
            <ChevronRight className="w-4 h-4" />
          </Button>
          {deal.hasRisk && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-card" title="At risk" />
          )}
        </div>
      </div>
    </Card>
  );
};

export default DealCard;
