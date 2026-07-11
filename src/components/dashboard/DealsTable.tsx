import { ChevronDown, ExternalLink, ArrowUpNarrowWide, ArrowDownNarrowWide, Eye, Zap, List, LayoutGrid } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DealExpandedRow from "./DealExpandedRow";
import DealCard from "./DealCard";
import { FilterBar, FilterBarLeft, FilterBarRight } from "./FilterBar";
import { deals, stageConfig, getProgressColor, getCompanyById } from "@/data/dealData";
import { useSearchStore } from "@/stores/searchStore";
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

const DealsTable = () => {
  const navigate = useNavigate();
  const { query: searchQuery } = useSearchStore();
  const { isAIPanelOpen } = useUIStore();
  const isTablet = useIsTablet();
  
  const [sortAsc, setSortAsc] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"winProbability" | "alignment" | "value" | "closeDate" | "company">("winProbability");
  const [expandedDealId, setExpandedDealId] = React.useState<number | null>(null);
  const [stageFilter, setStageFilter] = React.useState<"all" | "diagnose" | "validate" | "align" | "commit">("all");
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [userViewMode, setUserViewMode] = React.useState<"list" | "cards">("list");
  
  // Force cards view on tablet when AI panel is open
  const isTabletCompact = isTablet && isAIPanelOpen;
  const viewMode = isTabletCompact ? "cards" : userViewMode;
  const setViewMode = setUserViewMode;

  const toggleExpand = (dealId: number) => {
    setExpandedDealId(expandedDealId === dealId ? null : dealId);
  };

  const handleActionHub = (company: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/action-hub?company=${encodeURIComponent(company)}`);
  };

  // Filter deals
  const filteredDeals = deals.filter((deal) => {
    const company = getCompanyById(deal.companyId);
    const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (company?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                          (company?.industry.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesStage = stageFilter === "all" ? true : deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Sort deals
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === "company") {
      const companyA = getCompanyById(a.companyId)?.name || "";
      const companyB = getCompanyById(b.companyId)?.name || "";
      const comparison = companyA.localeCompare(companyB);
      return sortAsc ? comparison : -comparison;
    }
    
    let aVal: number, bVal: number;
    switch (sortBy) {
      case "winProbability":
        aVal = a.winProbability;
        bVal = b.winProbability;
        break;
      case "alignment":
        aVal = a.alignment;
        bVal = b.alignment;
        break;
      case "value":
        aVal = a.valueNumeric;
        bVal = b.valueNumeric;
        break;
      case "closeDate":
        aVal = new Date(a.closeDate).getTime();
        bVal = new Date(b.closeDate).getTime();
        break;
      default:
        return 0;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const stagePills = [
    { key: "all" as const, label: "All", count: deals.length, activeColor: "bg-foreground text-white", inactiveColor: "bg-muted text-muted-foreground" },
    { key: "diagnose" as const, label: "Diagnose", count: deals.filter(d => d.stage === "diagnose").length, activeColor: "bg-blue-400 text-white", inactiveColor: "bg-blue-400/20 text-blue-500" },
    { key: "validate" as const, label: "Validate", count: deals.filter(d => d.stage === "validate").length, activeColor: "bg-yellow text-white", inactiveColor: "bg-yellow/20 text-yellow-600" },
    { key: "align" as const, label: "Align", count: deals.filter(d => d.stage === "align").length, activeColor: "bg-purple text-white", inactiveColor: "bg-purple/20 text-purple" },
    { key: "commit" as const, label: "Commit", count: deals.filter(d => d.stage === "commit").length, activeColor: "bg-green text-white", inactiveColor: "bg-green/20 text-green" },
  ];

  const getStagePillStyles = (stageKey: string, isActive: boolean) => {
    const pill = stagePills.find(p => p.key === stageKey);
    if (!pill) return "bg-muted text-muted-foreground";
    return isActive ? pill.activeColor : pill.inactiveColor;
  };

  const sortLabels = {
    winProbability: "Win Probability",
    alignment: "Alignment",
    value: "Deal Value",
    closeDate: "Close Date",
    company: "Company",
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

  // Check if we're in tablet with AI panel open
  const isTabletWithAI = isTablet && isAIPanelOpen;

  return (
    <TooltipProvider>
      {/* Filter Bar - always in a card */}
      <Card className="p-0 overflow-visible">
        <FilterBar className={isTabletWithAI ? "flex-col items-stretch gap-3" : ""}>
          <FilterBarLeft className={isTabletWithAI ? "w-full" : ""}>
            {/* Stage Filter Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              {stagePills.map((stage) => (
                <button
                  key={stage.key}
                  onClick={() => setStageFilter(stage.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${getStagePillStyles(stage.key, stageFilter === stage.key)}`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </FilterBarLeft>

          <FilterBarRight className={isTabletWithAI ? "w-full justify-start" : ""}>
            {/* Sort Dropdown + Toggle - moved to right side for tablet 2-row layout */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm font-medium text-foreground"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {sortLabels[sortBy]}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[160px] animate-fade-in">
                    {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map((key) => (
                      <button
                        key={key}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${sortBy === key ? "bg-purple/10 text-purple font-medium" : ""}`}
                        onClick={() => { setSortBy(key); setShowSortDropdown(false); }}
                      >
                        {sortLabels[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center w-9 h-9 bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors"
                title={sortAsc ? "Ascending" : "Descending"}
              >
                {sortAsc ? (
                  <ArrowUpNarrowWide className="w-4 h-4" />
                ) : (
                  <ArrowDownNarrowWide className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {!isTabletWithAI && (
              <span className="hidden xl:inline text-sm text-muted-foreground">Showing {sortedDeals.length} of {deals.length} deals</span>
            )}
            {/* Hide view toggle on tablet when AI panel is open */}
            {!isTabletWithAI && (
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-gradient-to-r from-purple to-orange text-white" : "bg-transparent hover:bg-muted/50"}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 transition-colors ${viewMode === "cards" ? "bg-gradient-to-r from-purple to-orange text-white" : "bg-transparent hover:bg-muted/50"}`}
                  title="Cards view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* Hide CRM button on tablet when AI panel is open */}
            {!isTabletWithAI && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                    <span className="hidden xl:inline">Open CRM</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open CRM</p>
                </TooltipContent>
              </Tooltip>
            )}
          </FilterBarRight>
        </FilterBar>

        {/* List View - inside the card */}
        {viewMode === "list" && (
          <>
            {/* Column Headers */}
            <div className="grid grid-cols-[32px_48px_minmax(120px,1fr)_72px_80px_48px_48px_80px] xl:grid-cols-[32px_48px_minmax(120px,1fr)_80px_72px_80px_100px_100px_80px] gap-4 items-center px-4 py-2 bg-muted/50 text-xs text-muted-foreground tracking-wide border-b border-border">
              <div />
              <div />
              <div className="min-w-0 overflow-hidden truncate">Deal</div>
              <div className="hidden xl:flex justify-center">Stage</div>
              <div>Value</div>
              <div>Close By</div>
              <div>Win</div>
              <div>Alignment</div>
              <div />
            </div>

            {/* Deals List */}
            <div className="divide-y divide-border min-h-[200px]">
              {sortedDeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No deals found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    {stageFilter !== "all" 
                      ? `There are no deals in the "${stageFilter}" stage. Try selecting a different stage filter.`
                      : searchQuery 
                        ? "No deals match your search criteria. Try adjusting your search terms."
                        : "No deals available at this time."
                    }
                  </p>
                  {stageFilter !== "all" && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setStageFilter("all")}
                      className="border-purple text-purple hover:bg-purple hover:text-white"
                    >
                      View all stages
                    </Button>
                  )}
                </div>
              ) : (
                sortedDeals.map((deal) => {
                  const stageInfo = stageConfig[deal.stage];
                  const company = getCompanyById(deal.companyId);
                  const isExpanded = expandedDealId === deal.id;
                  
                    return (
                    <React.Fragment key={deal.id}>
                      <div 
                        className={`grid grid-cols-[32px_48px_minmax(120px,1fr)_72px_80px_48px_48px_80px] xl:grid-cols-[32px_48px_minmax(120px,1fr)_80px_72px_80px_100px_100px_80px] gap-4 items-center px-4 py-3 interactive-card-subtle ${isExpanded ? "bg-muted/30" : ""}`}
                        onClick={() => toggleExpand(deal.id)}
                      >
                        {/* Expand button */}
                        <button 
                          className="flex items-center justify-center w-7 h-7 rounded hover:bg-muted transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(deal.id);
                          }}
                        >
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {/* Company logo */}
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={company?.logo} alt={company?.name} className="object-contain p-1" />
                          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
                            {company?.name.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>

                        {/* Deal info - flexible width */}
                        <div className="min-w-0 overflow-hidden">
                          <p className="font-medium text-foreground truncate">{deal.name}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm text-muted-foreground truncate">{company?.name}</p>
                            {/* Stage dot - only on smaller screens */}
                            <div className={`xl:hidden shrink-0 w-2 h-2 rounded-full ${stageInfo.dotColor}`} title={stageInfo.label} />
                          </div>
                        </div>

                        {/* Stage badge - only on xl+ */}
                        <div className="hidden xl:flex justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`px-1.5 py-0.5 rounded-full text-xxs font-medium border ${stageInfo.colorClass} cursor-help`}>
                                {stageInfo.label}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{stageInfo.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Value */}
                        <div className="text-sm font-medium text-foreground">
                          {formatCompactValue(deal.valueNumeric)}
                        </div>

                        {/* Close By */}
                        <div className="text-sm text-muted-foreground">
                          {formatCompactDate(deal.closeDate)}
                        </div>

                        {/* Win Probability */}
                        <div className="flex items-center gap-1">
                          <div className="hidden xl:block w-9 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getProgressColor(deal.winProbability)}`}
                              style={{ width: `${deal.winProbability}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${getProgressColor(deal.winProbability).replace('bg-', 'text-')}`}>
                            {deal.winProbability}%
                          </span>
                        </div>

                        {/* Alignment */}
                        <div className="flex items-center gap-1">
                          <div className="hidden xl:block w-9 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${getProgressColor(deal.alignment)}`}
                              style={{ width: `${deal.alignment}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${getProgressColor(deal.alignment).replace('bg-', 'text-')}`}>
                            {deal.alignment}%
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end">
                          <div className="relative">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-purple text-purple bg-white hover:bg-gradient-to-r hover:from-purple hover:to-orange-500 hover:text-white hover:border-transparent transition-all"
                              onClick={(e) => handleActionHub(company?.name || "", e)}
                              title="Actions"
                            >
                              <Zap className="w-4 h-4" />
                              <span className="hidden 2xl:inline">Actions</span>
                            </Button>
                            {deal.hasRisk && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red rounded-full border-2 border-white animate-pulse" />
                            )}
                          </div>
                          <Button 
                            asChild
                            size="sm" 
                            variant="outline"
                            className="border-purple text-purple bg-white hover:bg-gradient-to-r hover:from-purple hover:to-orange-500 hover:text-white hover:border-transparent transition-all"
                            title="View"
                          >
                            <Link to={`/deal-gps?deal=${deal.id}`} onClick={(e) => e.stopPropagation()}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="animate-fade-in">
                          <DealExpandedRow dealId={deal.id} company={company?.name || ""} hasRisk={deal.hasRisk} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </>
        )}
      </Card>

      {/* Cards View - outside the card, directly on background */}
      {viewMode === "cards" && (
        <div className="mt-4">
          {sortedDeals.length === 0 ? (
            <Card className="p-0">
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Eye className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No deals found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  {stageFilter !== "all" 
                    ? `There are no deals in the "${stageFilter}" stage. Try selecting a different stage filter.`
                    : searchQuery 
                      ? "No deals match your search criteria. Try adjusting your search terms."
                      : "No deals available at this time."
                  }
                </p>
                {stageFilter !== "all" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setStageFilter("all")}
                    className="border-purple text-purple hover:bg-purple hover:text-white"
                  >
                    View all stages
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className={`grid gap-4 ${isTabletCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
              {sortedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      )}
    </TooltipProvider>
  );
};

export default DealsTable;