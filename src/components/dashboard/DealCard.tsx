import { Zap, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getProgressColor, getCompanyById } from "@/data/dealData";
import { useIsTablet } from "@/hooks/use-mobile";
import { useUIStore } from "@/stores/uiStore";

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

const getStageAccentColor = (stage: string) => {
  switch (stage) {
    case "commit": return "border-l-green";
    case "align": return "border-l-purple";
    case "validate": return "border-l-yellow";
    case "diagnose": return "border-l-blue-400";
    default: return "border-l-muted";
  }
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
  const stageBorderColor = getStageAccentColor(deal.stage);
  const isTablet = useIsTablet();
  const { isAIPanelOpen } = useUIStore();
  
  // Compact mode for tablet with AI panel open
  const isCompactMode = isTablet && isAIPanelOpen;

  const handleCardClick = () => {
    navigate(`/deal-gps?deal=${deal.id}`);
  };

  return (
    <Card 
      className={`group p-4 border-l-4 ${stageBorderColor} interactive-card interactive-card-gradient flex flex-col relative cursor-pointer`}
      onClick={handleCardClick}
    >
      {/* Ambient glow effect */}
      <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-purple/20 via-primary/10 to-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
      
      {/* Header: Logo + Deal Info */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={company?.logo} alt={company?.name} className="object-contain p-1" />
          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
            {company?.name.slice(0, 2).toUpperCase() || "??"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-foreground text-sm ${isCompactMode ? "" : "line-clamp-1"}`}>{deal.name}</p>
          {!isCompactMode && (
            <p className="text-xs text-muted-foreground truncate">{company?.name}</p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xxs text-muted-foreground uppercase tracking-wide mb-0.5">Value</p>
          <p className="text-sm font-semibold text-foreground">{formatCompactValue(deal.valueNumeric)}</p>
        </div>
        <div>
          <p className="text-xxs text-muted-foreground uppercase tracking-wide mb-0.5">Close By</p>
          <p className="text-sm text-foreground">{formatCompactDate(deal.closeDate)}</p>
        </div>
      </div>

      {/* Scores */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xxs text-muted-foreground uppercase tracking-wide">Win Probability</span>
          <span className={`text-xs font-semibold ${getProgressColor(deal.winProbability).replace('bg-', 'text-')}`}>
            {deal.winProbability}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xxs text-muted-foreground uppercase tracking-wide">Alignment</span>
          <span className={`text-xs font-semibold ${getProgressColor(deal.alignment).replace('bg-', 'text-')}`}>
            {deal.alignment}%
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
        <Button
          size="sm"
          className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white"
          onClick={(e) => { 
            e.stopPropagation(); 
            navigate(`/action-hub?company=${encodeURIComponent(company?.name || "")}`); 
          }}
          title="Actions"
        >
          <Zap className="w-4 h-4" />
          Actions
          <ChevronRight className="w-4 h-4" />
          {deal.hasRisk && (
            <div className="ml-1 w-2 h-2 bg-white/80 rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    </Card>
  );
};

export default DealCard;
