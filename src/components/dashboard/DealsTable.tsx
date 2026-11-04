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
import { deals, stageConfig, getCompanyById, formatCompactValue } from "@/data/dealData";
import { scoreText, selectedChip, unselectedChip } from "@/lib/tone";
import { useSearchStore } from "@/stores/searchStore";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { useUIStore } from "@/stores/uiStore";

// Format value as compact currency ($580K, $2.4M)
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
  const isMobile = useIsMobile();
  
  const [sortAsc, setSortAsc] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"winProbability" | "alignment" | "value" | "closeDate" | "company">("winProbability");
  const [expandedDealId, setExpandedDealId] = React.useState<number | null>(null);
  const [stageFilter, setStageFilter] = React.useState<"all" | "diagnose" | "validate" | "align" | "commit">("all");
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);
  const [userViewMode, setUserViewMode] = React.useState<"list" | "cards">("list");
  
  // Compact layout (cards view, stacked filters) on phones, and on tablets when the AI panel is open
  const isCompact = isMobile || (isTablet && isAIPanelOpen);
  const viewMode = isCompact ? "cards" : userViewMode;
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

  const stagePills = (["all", "diagnose", "validate", "align", "commit"] as const).map((key) => ({
    key,
    label: key === "all" ? "All" : stageConfig[key].label,
    dotColor: key === "all" ? null : stageConfig[key].dotColor,
  }));

  const sortLabels = {
    winProbability: "Win Probability",
    alignment: "Alignment",
    value: "Deal Value",
    closeDate: "Close Date",
    company: "Company",
  };


  const stageChips = (compact: boolean) =>
    stagePills.map((stage) => {
      const selected = stageFilter === stage.key;
      return (
        <button
          key={stage.key}
          onClick={() => setStageFilter(stage.key)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            compact ? `h-10 px-4 border ${selected ? "border-transparent" : "border-border bg-card"}` : "px-3 py-1"
          } ${selected ? selectedChip : unselectedChip}`}
        >
          {stage.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${stage.dotColor}`} />}
          {stage.label}
        </button>
      );
    });

  const sortMenu = showSortDropdown && (
    <div className={`absolute top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-40 animate-fade-in ${isCompact ? "right-0" : "left-0"}`}>
      {(Object.keys(sortLabels) as Array<keyof typeof sortLabels>).map((key) => (
        <button
          key={key}
          className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${sortBy === key ? `${selectedChip} font-medium` : ""}`}
          onClick={() => { setSortBy(key); setShowSortDropdown(false); }}
        >
          {sortLabels[key]}
        </button>
      ))}
      {isCompact && (
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border-t border-border hover:bg-muted transition-colors"
          onClick={() => setSortAsc(!sortAsc)}
        >
          {sortAsc ? <ArrowUpNarrowWide className="w-4 h-4" /> : <ArrowDownNarrowWide className="w-4 h-4" />}
          {sortAsc ? "Ascending" : "Descending"}
        </button>
      )}
    </div>
  );

  const emptyState = (
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
        <Button variant="outline" size="sm" onClick={() => setStageFilter("all")}>
          View all stages
        </Button>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      {isCompact ? (
        /* Phones: one scrolling chip row + a compact sort button */
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto">{stageChips(true)}</div>
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card text-foreground"
              title={`Sort by ${sortLabels[sortBy]}`}
            >
              {sortAsc ? <ArrowUpNarrowWide className="w-4 h-4" /> : <ArrowDownNarrowWide className="w-4 h-4" />}
            </button>
            {sortMenu}
          </div>
        </div>
      ) : (
      <Card className="p-0 overflow-visible">
        <FilterBar>
          <FilterBarLeft>
            <div className="flex items-center gap-1 flex-wrap">{stageChips(false)}</div>
          </FilterBarLeft>

          <FilterBarRight>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm font-medium text-foreground whitespace-nowrap"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {sortLabels[sortBy]}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                </button>
                {sortMenu}
              </div>
              <button 
                onClick={() => setSortAsc(!sortAsc)}
                className="flex items-center justify-center w-9 h-9 bg-muted rounded-lg text-foreground hover:bg-muted/80 transition-colors"
                title={sortAsc ? "Ascending" : "Descending"}
              >
                {sortAsc ? <ArrowUpNarrowWide className="w-4 h-4" /> : <ArrowDownNarrowWide className="w-4 h-4" />}
              </button>
            </div>
            <span className="hidden 2xl:inline text-sm text-muted-foreground">Showing {sortedDeals.length} of {deals.length} deals</span>
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? selectedChip : unselectedChip}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 transition-colors ${viewMode === "cards" ? selectedChip : unselectedChip}`}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                  <span className="hidden 2xl:inline">Open CRM</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open CRM</p>
              </TooltipContent>
            </Tooltip>
          </FilterBarRight>
        </FilterBar>

        {/* List View - inside the card */}
        {viewMode === "list" && (
          <>
            {/* Column Headers */}
            <div className="grid grid-cols-deals 2xl:grid-cols-deals-wide gap-4 items-center px-4 py-2 bg-muted/50 text-xs text-muted-foreground tracking-wide border-b border-border">
              <div />
              <div />
              <div className="min-w-0 overflow-hidden truncate">Deal</div>
              <div className="hidden 2xl:flex justify-center">Stage</div>
              <div>Value</div>
              <div>Close By</div>
              <div>Win</div>
              <div>Alignment</div>
              <div />
            </div>

            {/* Deals List */}
            <div className="divide-y divide-border min-h-50">
              {sortedDeals.length === 0 ? (
                emptyState
              ) : (
                sortedDeals.map((deal) => {
                  const stageInfo = stageConfig[deal.stage];
                  const company = getCompanyById(deal.companyId);
                  const isExpanded = expandedDealId === deal.id;
                  
                    return (
                    <React.Fragment key={deal.id}>
                      <div 
                        className={`grid grid-cols-deals 2xl:grid-cols-deals-wide gap-4 items-center px-4 py-3 interactive-card-subtle ${isExpanded ? "bg-muted/30" : ""}`}
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
                          <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs text-muted-foreground truncate">{company?.name}</p>
                            {/* Stage dot - only on smaller screens */}
                            <div className={`2xl:hidden shrink-0 w-2 h-2 rounded-full ${stageInfo.dotColor}`} title={stageInfo.label} />
                          </div>
                        </div>

                        {/* Stage badge - only on xl+ */}
                        <div className="hidden 2xl:flex justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xxs font-medium border ${stageInfo.colorClass} cursor-help`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dotColor}`} />
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
                        <div>
                          <span className={`text-xs font-semibold ${scoreText(deal.winProbability)}`}>
                            {deal.winProbability}%
                          </span>
                        </div>

                        {/* Alignment */}
                        <div>
                          <span className={`text-xs font-semibold ${scoreText(deal.alignment)}`}>
                            {deal.alignment}%
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 justify-end">
                          <div className="relative">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => handleActionHub(company?.name || "", e)}
                              title="Actions"
                            >
                              <Zap className="w-4 h-4" />
                              <span className="hidden 2xl:inline">Actions</span>
                            </Button>
                            {deal.hasRisk && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-card" />
                            )}
                          </div>
                          <Button 
                            asChild
                            size="sm" 
                            variant="outline"
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
      )}

      {/* Cards View - outside the card, directly on background */}
      {viewMode === "cards" && (
        <div className={isCompact ? "mt-3" : "mt-4"}>
          {sortedDeals.length === 0 ? (
            <Card className="p-0">{emptyState}</Card>
          ) : (
            <div className={`grid ${isCompact ? 'gap-3 grid-cols-1 sm:grid-cols-2' : 'gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
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