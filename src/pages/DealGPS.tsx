// DealGPS Page - Deal Analysis and Stakeholder Management
import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useIsTablet, useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams, Link } from "react-router-dom";
import { 
  ExternalLink, 
  Users, 
  TrendingUp, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Mail,
  Info,
  Calendar,
  Sparkles,
  MoreHorizontal,
  Video,
  ArrowRight,
  Target,
  Zap
} from "lucide-react";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ActionEmailDialog from "@/components/dashboard/ActionEmailDialog";
import ActionMeetingDialog from "@/components/dashboard/ActionMeetingDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/dashboard/Header";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import MobileBottomNav from "@/components/MobileBottomNav";
import { WinPathSection } from "@/components/deal-gps/WinPathSection";
import { BuyerProfileSection } from "@/components/deal-gps/BuyerProfileSection";

import { SignalsRisksSection } from "@/components/deal-gps/SignalsRisksSection";
import { RecommendedOfferingsSection, type RecommendedOffering } from "@/components/deal-gps/RecommendedOfferingsSection";
import { type CrossSellData } from "@/components/dashboard/ActionEmailDialog";
import AlignmentIntelligenceModal from "@/components/deal-gps/AlignmentIntelligenceModal";
import WinProbabilityIntelligenceModal from "@/components/deal-gps/WinProbabilityIntelligenceModal";


import {
  deals,
  getDealById,
  getStakeholdersForDeal,
  getActionsForDeal,
  stageConfig,
  getProgressColor,
  getDonutColor,
  avatarColors,
  getCompanyById,
  type Deal,
  type Stakeholder,
  type Action,
} from "@/data/dealData";
import { 
  getScoreForDeal, 
  metricToPercent, 
  METRIC_LABELS,
  STAKEHOLDER_METRIC_LABELS,
  calculateStakeholderAlignment,
  type DealMetrics,
  type StakeholderMetrics
} from "@/lib/scoring";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

// Format value as compact currency ($580K, $2.4M)
const formatCompactValue = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`.replace('.0M', 'M');
  }
  return `$${(value / 1000).toFixed(0)}K`;
};

// Format date as MM.DD.YY
const formatCompactDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${mm}.${dd}.${yy}`;
};

const DealGPS = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dealIdParam = searchParams.get("deal");
  const dealId = dealIdParam ? parseInt(dealIdParam) : 1;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const isTabletCompact = isTablet && isAIPanelOpen;
  const [isWinPathOpen, setIsWinPathOpen] = useState(true);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const [isBuyerProfileOpen, setIsBuyerProfileOpen] = useState(false);
  
  const [isStakeholdersOpen, setIsStakeholdersOpen] = useState(true);
  const [isSignalsRisksOpen, setIsSignalsRisksOpen] = useState(true);
  const [isRecommendedOfferingsOpen, setIsRecommendedOfferingsOpen] = useState(false);
  const [crossSellData, setCrossSellData] = useState<CrossSellData | null>(null);
  const [selectedAction, setSelectedAction] = useState<{
    id: number;
    stakeholderIds: number[];
    stakeholderName: string;
    stakeholderRole: string;
    artifact: string;
    basedOn: string;
    priority: "high" | "medium" | "low";
  } | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [actionsPage, setActionsPage] = useState(1);
  const [alignmentModalOpen, setAlignmentModalOpen] = useState(false);
  const [winProbModalOpen, setWinProbModalOpen] = useState(false);
  const ACTIONS_PER_PAGE = 4;
  const { openPopup } = useStakeholderPopup();

  const deal = getDealById(dealId) || deals[0];
  const company = getCompanyById(deal.companyId);
  const stakeholders = getStakeholdersForDeal(dealId);
  const dealActions = getActionsForDeal(dealId);
  const stageInfo = stageConfig[deal.stage];

  // Cross-sell data map for offerings
  const crossSellDataMap: Record<string, CrossSellData> = {
    "Managed Security": {
      offeringName: "Managed Security",
      alignmentPct: 92,
      signals: [
        { source: "Call transcript", stakeholder: "Priya Sharma", quote: "We have serious concerns about data residency — need to ensure all processing stays within US boundaries" },
        { source: "Email", stakeholder: "Priya Sharma", quote: "Our legal team flagged NYDFS 500 deadline in Q3 — we need a compliance-ready security layer before then" },
        { source: "External", stakeholder: "Industry Report", quote: "Gartner predicts 60% of enterprises will consolidate to managed security by 2026" },
      ],
      buyerNeed: "Compliance-ready security operations with US data residency, driven by NYDFS 500 deadline in Q3",
      capabilityMatch: "Our Managed Security service provides 24/7 SOC with guaranteed US-only data processing and built-in regulatory compliance frameworks",
      costOfInaction: "Failure to meet NYDFS 500 deadline could result in $2M–$5M in regulatory penalties and loss of financial services clients",
    },
    "Compliance Audit": {
      offeringName: "Compliance Audit",
      alignmentPct: 85,
      signals: [
        { source: "Call transcript", stakeholder: "Lisa Wang", quote: "Our audit prep cycle takes 3 months — we need to cut that in half" },
        { source: "Email", stakeholder: "Lisa Wang", quote: "Board is asking for continuous compliance monitoring, not just annual audits" },
      ],
      buyerNeed: "Reduce audit preparation cycle from 3 months to 6 weeks with continuous compliance monitoring",
      capabilityMatch: "Automated evidence collection and continuous control monitoring reduces audit prep by 60% while satisfying board-level reporting needs",
      costOfInaction: "Extended audit cycles increase risk of compliance gaps going undetected, potentially delaying SOC 2 renewal by 2+ quarters",
    },
    "Cloud Migration": {
      offeringName: "Cloud Migration",
      alignmentPct: 71,
      signals: [
        { source: "Call transcript", stakeholder: "Michael Torres", quote: "Our on-prem infrastructure is approaching end-of-life but we haven't scoped the migration yet" },
        { source: "External", stakeholder: "Market Analysis", quote: "Competitor announced hybrid cloud offering — potential urgency driver" },
      ],
      buyerNeed: "Migration path for end-of-life on-prem infrastructure with minimal disruption to operations",
      capabilityMatch: "Phased migration framework with hybrid support ensures zero-downtime transition while maintaining security posture",
      costOfInaction: "End-of-life hardware increases breach risk by 3x and maintenance costs escalate 40% annually after warranty expiration",
    },
  };

  const handleCreateCrossSellAction = (offering: RecommendedOffering) => {
    const csData = crossSellDataMap[offering.name];
    if (!csData) return;

    // Create a synthetic action and open the modal
    const primaryStakeholder = stakeholders[0];
    setSelectedAction({
      id: Date.now(), // unique temp id
      stakeholderIds: primaryStakeholder ? [primaryStakeholder.id] : [],
      stakeholderName: offering.signals[0]?.stakeholder || primaryStakeholder?.name || "Unknown",
      stakeholderRole: primaryStakeholder?.role || "Unknown",
      artifact: offering.name,
      basedOn: offering.signals[0]?.quote || "",
      priority: "medium",
    });
    setCrossSellData(csData);
    setEmailDialogOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById("main-scroll");
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 60);
      }
    };

    const mainContent = document.getElementById("main-scroll");
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDealChange = (newDealId: number) => {
    setSearchParams({ deal: newDealId.toString() });
  };

  // Get calculated score from scoring engine
  const dealScore = getScoreForDeal(dealId);
  
  // Extract metrics as percentages - 3 Win Probability metrics
  const alignmentPct = metricToPercent(dealScore.metrics.alignment);
  const consensusPct = metricToPercent(dealScore.metrics.consensus);
  const sentimentPct = metricToPercent(dealScore.metrics.sentiment);
  
  // Risk detection - the lowest metric
  const primaryRiskMetric = dealScore.primaryRiskMetric;
  const isGuardrailActive = dealScore.isGuardrailActive;
  
  // Calculate stakeholder alignment using the new 4-metric system
  const stakeholderAlignmentInput = {
    stakeholders: stakeholders.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      alignment: s.alignment,
      sentiment: s.sentiment,
      engagementCategory: s.engagementCategory,
      status: s.status
    }))
  };
  const stakeholderAlignment = calculateStakeholderAlignment(stakeholderAlignmentInput);
  
  // Extract metrics as percentages for display - 3 Alignment metrics
  const capabilityPct = metricToPercent(stakeholderAlignment.metrics.capability);
  const messageFitPct = metricToPercent(stakeholderAlignment.metrics.messageFit);
  const valueTranslationPct = metricToPercent(stakeholderAlignment.metrics.valueTranslation);
  const stakeholderAlignmentScore = stakeholderAlignment.alignmentScore;
  const stakeholderPrimaryRisk = stakeholderAlignment.primaryRiskMetric;
  
  // Legacy averages for trend calculation - guard against division by zero
  const avgAlignment = stakeholders.length > 0 
    ? Math.round(stakeholders.reduce((acc, s) => acc + s.alignment, 0) / stakeholders.length) 
    : 0;
  const avgPriority = stakeholders.length > 0 
    ? Math.round(stakeholders.reduce((acc, s) => acc + s.priority, 0) / stakeholders.length) 
    : 0;
  const avgSentiment = stakeholders.length > 0 
    ? Math.round(stakeholders.reduce((acc, s) => acc + s.sentiment, 0) / stakeholders.length) 
    : 0;

  // Engagement categorization
  const engagedStakeholders = stakeholders.filter(s => s.engagementCategory === "engaged");
  const silentStakeholders = stakeholders.filter(s => s.engagementCategory === "silent");
  const hiddenStakeholders = stakeholders.filter(s => s.engagementCategory === "hidden");

  // Pie chart data - use calculated win probability
  const winProb = dealScore.winProbability;
  const pieData = [
    { name: "Win Probability", value: winProb },
    { name: "Remaining", value: 100 - winProb },
  ];

  // Generate interesting, wavy trend data with peaks and valleys - 3 metrics
  const generateWinProbTrendData = () => {
    const startDate = new Date(deal.dealStartDate);
    const now = new Date();
    const points: { date: string; alignment: number; consensus: number; sentiment: number }[] = [];
    
    // Start values - lower to show growth, using 35% floor minimum
    const startAlignment = Math.max(35, alignmentPct - 22 - Math.random() * 12);
    const startConsensus = Math.max(35, consensusPct - 20 - Math.random() * 10);
    const startSentiment = Math.max(35, sentimentPct - 18 - Math.random() * 8);
    
    // Calculate total points needed
    let current = new Date(startDate);
    let totalPoints = 0;
    while (current <= now) {
      totalPoints++;
      current.setDate(current.getDate() + 10);
    }
    
    // Generate wavy data with intentional peaks and valleys using basis spline-like curves
    current = new Date(startDate);
    let pointIndex = 0;
    while (current <= now) {
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      
      // Create wave pattern with sine-like variations - different frequencies for each
      const wavePhase = (pointIndex / Math.max(totalPoints, 1)) * Math.PI * 3;
      const alignmentWave = Math.sin(wavePhase * 1.3 + 1.2) * 10 + Math.sin(wavePhase * 2.8 + 0.5) * 4;
      const consensusWave = Math.sin(wavePhase * 1.5 + 0.2) * 8 + Math.sin(wavePhase * 3.1) * 4;
      const sentimentWave = Math.sin(wavePhase * 2 + 0.7) * 7 + Math.cos(wavePhase * 2.5) * 5;
      
      // Add random noise for realism
      const alignmentNoise = (Math.random() - 0.5) * 6;
      const consensusNoise = (Math.random() - 0.5) * 5;
      const sentimentNoise = (Math.random() - 0.5) * 4;
      
      // Progress towards target
      const progress = pointIndex / Math.max(totalPoints - 1, 1);
      const targetAlignment = startAlignment + (alignmentPct - startAlignment) * progress;
      const targetConsensus = startConsensus + (consensusPct - startConsensus) * progress;
      const targetSentiment = startSentiment + (sentimentPct - startSentiment) * progress;
      
      points.push({
        date: `${month}.${day}`,
        alignment: Math.round(Math.min(97, Math.max(35, targetAlignment + alignmentWave + alignmentNoise))),
        consensus: Math.round(Math.min(97, Math.max(35, targetConsensus + consensusWave + consensusNoise))),
        sentiment: Math.round(Math.min(97, Math.max(35, targetSentiment + sentimentWave + sentimentNoise))),
      });
      
      current.setDate(current.getDate() + 10);
      pointIndex++;
    }
    
    // Ensure final values match current metrics
    if (points.length > 0) {
      points[points.length - 1].alignment = alignmentPct;
      points[points.length - 1].consensus = consensusPct;
      points[points.length - 1].sentiment = sentimentPct;
    }
    return points;
  };
  const winProbTrendData = generateWinProbTrendData();

  // Calculate actual trends from graph data (compare first and last points) - 3 metrics
  const calculateTrend = (data: typeof winProbTrendData, key: 'alignment' | 'consensus' | 'sentiment') => {
    if (data.length < 2) return 0;
    const first = data[0][key];
    const last = data[data.length - 1][key];
    return Math.round(last - first);
  };

  const alignmentTrend = calculateTrend(winProbTrendData, 'alignment');
  const consensusTrend = calculateTrend(winProbTrendData, 'consensus');
  const sentimentTrend = calculateTrend(winProbTrendData, 'sentiment');
  
  // Win probability trend based on overall health
  const winProbTrend = Math.round((alignmentTrend + consensusTrend + sentimentTrend) / 3);

  // Calculate stakeholder alignment metric trends
  const calculateAlignmentTrend = (data: typeof alignmentTrendData, key: 'capability' | 'messageFit' | 'valueTranslation') => {
    if (data.length < 2) return 0;
    const first = data[0][key];
    const last = data[data.length - 1][key];
    return Math.round(last - first);
  };

  // Helper to get score color based on value
  const getScoreColor = (value: number) => {
    if (value > 70) return 'text-green';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red';
  };

  // Generate stakeholder alignment trend data (3 new metrics) with organic wavy curves
  const generateAlignmentTrendData = () => {
    const startDate = new Date(deal.dealStartDate);
    const now = new Date();
    const points: { date: string; capability: number; messageFit: number; valueTranslation: number }[] = [];
    
    const startCap = Math.max(35, capabilityPct - 20 - Math.random() * 8);
    const startMF = Math.max(35, messageFitPct - 18 - Math.random() * 10);
    const startVT = Math.max(35, valueTranslationPct - 22 - Math.random() * 8);
    
    let current = new Date(startDate);
    let totalPoints = 0;
    while (current <= now) {
      totalPoints++;
      current.setDate(current.getDate() + 10);
    }
    
    current = new Date(startDate);
    let pointIndex = 0;
    while (current <= now) {
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      
      // Create beautiful organic wave patterns with multiple sine harmonics
      const wavePhase = (pointIndex / Math.max(totalPoints, 1)) * Math.PI * 3;
      const capWave = Math.sin(wavePhase * 1.9 + 0.3) * 8 + Math.sin(wavePhase * 3.5) * 3;
      const mfWave = Math.sin(wavePhase * 1.4 + 0.9) * 9 + Math.cos(wavePhase * 2.8 + 0.4) * 4;
      const vtWave = Math.sin(wavePhase * 2.3 + 0.5) * 6 + Math.sin(wavePhase * 3.1 + 1.1) * 3;
      
      const progress = pointIndex / Math.max(totalPoints - 1, 1);
      
      points.push({
        date: `${month}.${day}`,
        capability: Math.round(Math.min(97, Math.max(35, startCap + (capabilityPct - startCap) * progress + capWave + (Math.random() - 0.5) * 4))),
        messageFit: Math.round(Math.min(97, Math.max(35, startMF + (messageFitPct - startMF) * progress + mfWave + (Math.random() - 0.5) * 5))),
        valueTranslation: Math.round(Math.min(97, Math.max(35, startVT + (valueTranslationPct - startVT) * progress + vtWave + (Math.random() - 0.5) * 3))),
      });
      
      current.setDate(current.getDate() + 10);
      pointIndex++;
    }
    
    if (points.length > 0) {
      points[points.length - 1].capability = capabilityPct;
      points[points.length - 1].messageFit = messageFitPct;
      points[points.length - 1].valueTranslation = valueTranslationPct;
    }
    return points;
  };
  const alignmentTrendData = generateAlignmentTrendData();

  // Calculate stakeholder alignment individual metric trends
  const capabilityTrend = calculateAlignmentTrend(alignmentTrendData, 'capability');
  const messageFitTrend = calculateAlignmentTrend(alignmentTrendData, 'messageFit');
  const valueTranslationTrend = calculateAlignmentTrend(alignmentTrendData, 'valueTranslation');
  
  // Stakeholder alignment overall trend
  const stakeholderAlignmentTrend = Math.round((capabilityTrend + messageFitTrend + valueTranslationTrend) / 3);

  // Trend indicator component
  const TrendIndicator = ({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) => {
    const isPositive = value > 0;
    const textSize = size === "sm" ? "text-xs" : "text-sm";
    return (
      <span className={`${textSize} font-medium ${isPositive ? "text-green" : "text-red"}`}>
        {isPositive ? "↑" : "↓"}{Math.abs(value)}%
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header - hides on scroll */}
        <div className={`transition-all duration-200 ${isScrolled ? "h-0 opacity-0 overflow-hidden" : ""}`}>
          <Header isScrolled={isScrolled} />
        </div>
        
        {/* Tab Navigation + AI Header - side by side */}
        <div className="flex border-b border-border bg-white">
          <div className="flex-1">
            <TabNavigation isScrolled={isScrolled} activeTab="Deal GPS" />
          </div>
          
          {/* AI Header - collapsible toggle - ONLY tablet/desktop */}
          {!isMobile && (
            <div className={`flex items-center gap-2 px-2 md:px-4 border-l border-border transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-10 md:w-12"}`}>
              {isAIPanelOpen && (
                <>
                  <img src="/assets/loomik-icon.svg" alt="Loomik" className="h-4 md:h-5 w-auto" />
                  <div className="w-2 h-2 bg-green rounded-full" />
                </>
              )}
              <button 
                onClick={toggleAIPanel}
                className="ml-auto p-1 hover:bg-muted rounded transition-colors"
              >
                {isAIPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        <div className={`flex flex-1 overflow-hidden p-6 gap-6 ${isMobile ? 'pb-20' : ''}`}>
          {/* Left column: Deal Tab Bar + Main Content */}
          <Card className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Unified Deal Header */}
            <div className={`p-4 border-b border-border shrink-0 ${isTabletCompact ? 'space-y-2' : 'flex items-center justify-between'}`}>
              {/* Row 1: Avatar + Deal Name + Company (+ Stage for tablet compact) */}
              <div className="flex items-center gap-3">
                <Avatar className={`${isTabletCompact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  <AvatarImage src={company?.logo} alt={company?.name} className="object-contain p-1" />
                  <AvatarFallback className="text-sm font-semibold">{company?.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <Select value={dealId.toString()} onValueChange={(value) => handleDealChange(parseInt(value))}>
                  <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto focus:ring-0 gap-2">
                    <span className={`font-semibold ${isTabletCompact ? 'text-base' : 'text-lg'}`}>{deal.name}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border z-50">
                    {deals.map(d => {
                      const dCompany = getCompanyById(d.companyId);
                      return (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{d.name}</span>
                            <span className="text-muted-foreground text-xs">({dCompany?.name})</span>
                            {d.hasRisk && (
                              <div className="w-2 h-2 bg-red rounded-full" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {!isTabletCompact && <span className="text-xs text-muted-foreground">({company?.name})</span>}
                {!isTabletCompact && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help ${stageInfo.colorClass}`}>
                        {stageInfo.label}
                        <Info className="w-3 h-3 opacity-60" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{stageInfo.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Row 2 (tablet compact) or Right side (desktop): Stage + Metadata + CRM */}
              <div className="flex items-center gap-3 text-sm">
                {isTabletCompact && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border cursor-help ${stageInfo.colorClass}`}>
                        {stageInfo.label}
                        <Info className="w-3 h-3 opacity-60" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{stageInfo.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <span className="font-medium text-muted-foreground">{formatCompactDate(deal.closeDate)}</span>
                <span className="text-border">|</span>
                <span className="font-medium">{formatCompactValue(deal.valueNumeric)}</span>
                {!isTabletCompact && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="flex items-center gap-2 text-sm text-primary font-medium hover:underline ml-2" title="Open CRM">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open CRM</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
            
            {/* Main Content - scrollable */}
            <main id="main-scroll" className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Section 1: Win Probability */}
              <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                <section className="space-y-4">
                  {/* Section Header Card */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 bg-gradient-to-r from-purple/5 to-transparent border-l-4 border-l-purple cursor-pointer hover:bg-purple/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple/10">
                          <TrendingUp className="w-5 h-5 text-purple" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-foreground">Win Probability</h2>
                          {!isTabletCompact && (
                            <p className="text-sm text-muted-foreground">
                              {deal.summary.headline}
                            </p>
                          )}
                        </div>
                        {isAnalysisOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground ml-auto" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground ml-auto" />
                        )}
                      </div>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">

                {/* Summary Box */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple" />
                    Summary
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-base text-foreground leading-relaxed">
                      {deal.summary.context} The deal has progressed through {deal.stage === 'diagnose' ? 'discovery phase' : deal.stage === 'validate' ? 'validation stage' : deal.stage === 'align' ? 'alignment phase' : 'closing stage'} with {engagedStakeholders.length} actively engaged stakeholders.{silentStakeholders.length > 0 ? ` ${silentStakeholders.length} stakeholder${silentStakeholders.length > 1 ? 's remain' : ' remains'} silent and may need re-engagement.` : ' All stakeholders are actively participating.'}
                    </p>
                  </div>
                </div>

                {/* Two Analysis Cards */}
                <div className={`${isTabletCompact ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-5'}`}>
                  {/* Win Probability Analysis Card */}
                  {isTabletCompact ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-purple" />
                        <span className="font-semibold text-foreground text-sm">Win Probability</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        {/* Score Badge (Top) */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                          winProb > 70 ? 'bg-green' : winProb >= 50 ? 'bg-yellow' : 'bg-red'
                        }`}>
                          {winProb}%
                        </div>
                        
                        {/* Overall Trend */}
                        <TrendIndicator value={winProbTrend} size="md" />
                        
                        {/* Metrics List (Bottom) - 3 metrics with trends */}
                        <div className="w-full space-y-1 pt-2 border-t border-border">
                          {[
                            { label: 'Alignment', value: alignmentPct, trend: alignmentTrend },
                            { label: 'Consensus', value: consensusPct, trend: consensusTrend },
                            { label: 'Sentiment', value: sentimentPct, trend: sentimentTrend },
                          ].map(m => (
                            <div key={m.label} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{m.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getScoreColor(m.value)}`}>{m.value}%</span>
                                <TrendIndicator value={m.trend} size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setWinProbModalOpen(true)}
                      className="group cursor-pointer rounded-xl transition-all duration-300 ease-out p-5 space-y-5 border border-border bg-card hover:bg-purple/5 hover:border-purple/30 hover:shadow-lg hover:shadow-purple/20"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setWinProbModalOpen(true)}
                    >
                      <div className="flex items-center justify-between pointer-events-none">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple" />
                          Win Probability
                        </h3>
                      </div>
                      
                      {/* Donut + Score Bars Group */}
                      <div className="bg-muted/20 rounded-xl p-5 pointer-events-none">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-24 h-24 shrink-0">
                              <div className="absolute inset-0 rounded-full blur-xl opacity-40 transition-opacity duration-500" style={{ backgroundColor: winProb > 70 ? 'hsl(142 70% 30%)' : winProb >= 50 ? 'hsl(45 90% 40%)' : 'hsl(0 70% 30%)' }} />
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <defs>
                                    <filter id="donutGlow1" x="-50%" y="-50%" width="200%" height="200%">
                                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <linearGradient id="donutGradient1" x1="0" y1="0" x2="1" y2="1">
                                      <stop offset="0%" stopColor={getDonutColor(winProb)} stopOpacity={1}/>
                                      <stop offset="100%" stopColor={getDonutColor(winProb)} stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={46} paddingAngle={2} dataKey="value" filter="url(#donutGlow1)">
                                    <Cell fill="url(#donutGradient1)" />
                                    <Cell fill="hsl(var(--muted)/0.3)" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xl font-bold drop-shadow-lg ${getScoreColor(winProb)}`}>{winProb}%</span>
                              </div>
                            </div>
                            <TrendIndicator value={winProbTrend} size="md" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">Alignment</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(alignmentPct)}`}>{alignmentPct}%</span>
                                  <TrendIndicator value={alignmentTrend} size="sm" />
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(alignmentPct)}`} style={{ width: `${alignmentPct}%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">Consensus</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(consensusPct)}`}>{consensusPct}%</span>
                                  <TrendIndicator value={consensusTrend} size="sm" />
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(consensusPct)}`} style={{ width: `${consensusPct}%` }} />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground">Sentiment</span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(sentimentPct)}`}>{sentimentPct}%</span>
                                  <TrendIndicator value={sentimentTrend} size="sm" />
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getProgressColor(sentimentPct)}`} style={{ width: `${sentimentPct}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trend Chart Group */}
                      <div className="bg-muted/20 rounded-xl p-5 pointer-events-none">
                        <p className="text-sm text-muted-foreground mb-3">Trend since deal start</p>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={winProbTrendData}>
                              <defs>
                                <linearGradient id="gradAlignment" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="hsl(var(--purple))" stopOpacity={0.6}/>
                                  <stop offset="50%" stopColor="hsl(var(--purple))" stopOpacity={0.3}/>
                                  <stop offset="100%" stopColor="hsl(var(--purple))" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="gradConsensus" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="gradSentiment" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="hsl(var(--green))" stopOpacity={0.5}/>
                                  <stop offset="50%" stopColor="hsl(var(--green))" stopOpacity={0.2}/>
                                  <stop offset="100%" stopColor="hsl(var(--green))" stopOpacity={0.05}/>
                                </linearGradient>
                                <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2" result="blur"/>
                                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                              <YAxis hide domain={[0, 100]} />
                              <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                              <Area type="natural" dataKey="alignment" name="Alignment" stroke="hsl(var(--purple))" strokeWidth={2.5} fill="url(#gradAlignment)" dot={false} activeDot={{ r: 6, fill: 'hsl(var(--purple))', stroke: 'white', strokeWidth: 2 }} filter="url(#lineGlow)" />
                              <Area type="natural" dataKey="consensus" name="Consensus" stroke="#3b82f6" strokeWidth={2} fill="url(#gradConsensus)" dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }} />
                              <Area type="natural" dataKey="sentiment" name="Sentiment" stroke="hsl(var(--green))" strokeWidth={2} fill="url(#gradSentiment)" dot={false} activeDot={{ r: 6, fill: 'hsl(var(--green))', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-purple rounded" /><span className="text-xs text-muted-foreground">Alignment</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-blue-500 rounded" /><span className="text-xs text-muted-foreground">Consensus</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-green rounded" /><span className="text-xs text-muted-foreground">Sentiment</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stakeholder Alignment Card */}
                  {isTabletCompact ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-purple" />
                        <span className="font-semibold text-foreground text-sm">Alignment</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        {/* Score Badge (Top) */}
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                          stakeholderAlignmentScore > 70 ? 'bg-green' : stakeholderAlignmentScore >= 50 ? 'bg-yellow' : 'bg-red'
                        }`}>
                          {stakeholderAlignmentScore}%
                        </div>
                        
                        {/* Overall Trend */}
                        <TrendIndicator value={stakeholderAlignmentTrend} size="md" />
                        
                        {/* Metrics List (Bottom) - 3 metrics with trends */}
                        <div className="w-full space-y-1 pt-2 border-t border-border">
                          {[
                            { label: 'Capability', value: capabilityPct, trend: capabilityTrend },
                            { label: 'Message Fit', value: messageFitPct, trend: messageFitTrend },
                            { label: 'Value Translation', value: valueTranslationPct, trend: valueTranslationTrend },
                          ].map(m => (
                            <div key={m.label} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{m.label}</span>
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${getScoreColor(m.value)}`}>{m.value}%</span>
                                <TrendIndicator value={m.trend} size="sm" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Full Stakeholder Alignment Card - Clickable */
                    <div 
                      onClick={() => setAlignmentModalOpen(true)}
                      className="group cursor-pointer rounded-xl transition-all duration-300 ease-out p-5 space-y-5 border border-border bg-card hover:bg-purple/5 hover:border-purple/30 hover:shadow-lg hover:shadow-purple/20"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setAlignmentModalOpen(true)}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pointer-events-none">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-purple" />
                          Alignment
                        </h3>
                        {stakeholderAlignment.isGuardrailActive && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow/10 border border-yellow/30 rounded-full text-xs font-medium text-yellow-700">
                            <div className="w-2 h-2 bg-yellow rounded-full" />
                            {stakeholderPrimaryRisk && STAKEHOLDER_METRIC_LABELS[stakeholderPrimaryRisk]} Risk
                          </div>
                        )}
                      </div>
                      
                      {/* Donut + Score Bars Group */}
                      <div className="bg-muted/20 rounded-xl p-5 pointer-events-none">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-24 h-24 shrink-0">
                              <div className="absolute inset-0 rounded-full blur-xl opacity-40 transition-opacity duration-500" style={{ backgroundColor: stakeholderAlignmentScore > 70 ? 'hsl(142 70% 30%)' : stakeholderAlignmentScore >= 50 ? 'hsl(45 90% 40%)' : 'hsl(0 70% 30%)' }} />
                              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <defs>
                                    <filter id="donutGlow2" x="-50%" y="-50%" width="200%" height="200%">
                                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                    </filter>
                                    <linearGradient id="donutGradient2" x1="0" y1="0" x2="1" y2="1">
                                      <stop offset="0%" stopColor={getDonutColor(stakeholderAlignmentScore)} stopOpacity={1}/>
                                      <stop offset="100%" stopColor={getDonutColor(stakeholderAlignmentScore)} stopOpacity={0.7}/>
                                    </linearGradient>
                                  </defs>
                                  <Pie data={[{ name: "Alignment", value: stakeholderAlignmentScore }, { name: "Remaining", value: 100 - stakeholderAlignmentScore }]} cx="50%" cy="50%" innerRadius={38} outerRadius={46} paddingAngle={2} dataKey="value" filter="url(#donutGlow2)">
                                    <Cell fill="url(#donutGradient2)" />
                                    <Cell fill="hsl(var(--muted)/0.3)" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xl font-bold drop-shadow-lg ${getScoreColor(stakeholderAlignmentScore)}`}>{stakeholderAlignmentScore}%</span>
                              </div>
                            </div>
                            <TrendIndicator value={stakeholderAlignmentTrend} size="md" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">Capability<Info className="w-3 h-3 opacity-60" /></span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(capabilityPct)}`}>{capabilityPct}%</span>
                                  <TrendIndicator value={capabilityTrend} size="sm" />
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${getProgressColor(capabilityPct)}`} style={{ width: `${capabilityPct}%` }} /></div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">Message Fit<Info className="w-3 h-3 opacity-60" /></span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(messageFitPct)}`}>{messageFitPct}%</span>
                                  <TrendIndicator value={messageFitTrend} size="sm" />
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${getProgressColor(messageFitPct)}`} style={{ width: `${messageFitPct}%` }} /></div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">Value Translation<Info className="w-3 h-3 opacity-60" /></span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(valueTranslationPct)}`}>{valueTranslationPct}%</span>
                                  <TrendIndicator value={valueTranslationTrend} size="sm" />
                                </div>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${getProgressColor(valueTranslationPct)}`} style={{ width: `${valueTranslationPct}%` }} /></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trend Chart Group */}
                      <div className="bg-muted/20 rounded-xl p-5 pointer-events-none">
                        <p className="text-sm text-muted-foreground mb-3">Trend since deal start</p>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={alignmentTrendData}>
                              <defs>
                                <linearGradient id="gradCapability" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="hsl(var(--purple))" stopOpacity={0.6}/>
                                  <stop offset="50%" stopColor="hsl(var(--purple))" stopOpacity={0.3}/>
                                  <stop offset="100%" stopColor="hsl(var(--purple))" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="gradMsgFit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5}/>
                                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                                </linearGradient>
                                <linearGradient id="gradValueTrans" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="hsl(var(--green))" stopOpacity={0.5}/>
                                  <stop offset="50%" stopColor="hsl(var(--green))" stopOpacity={0.2}/>
                                  <stop offset="100%" stopColor="hsl(var(--green))" stopOpacity={0.05}/>
                                </linearGradient>
                                <filter id="lineGlow2" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="2" result="blur"/>
                                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                                </filter>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                              <YAxis hide domain={[0, 100]} />
                              <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                              <Area type="natural" dataKey="capability" name="Capability" stroke="hsl(var(--purple))" strokeWidth={2.5} fill="url(#gradCapability)" dot={false} activeDot={{ r: 6, fill: 'hsl(var(--purple))', stroke: 'white', strokeWidth: 2 }} filter="url(#lineGlow2)" />
                              <Area type="natural" dataKey="messageFit" name="Message Fit" stroke="#3b82f6" strokeWidth={2} fill="url(#gradMsgFit)" dot={false} activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }} />
                              <Area type="natural" dataKey="valueTranslation" name="Value Translation" stroke="hsl(var(--green))" strokeWidth={2} fill="url(#gradValueTrans)" dot={false} activeDot={{ r: 6, fill: 'hsl(var(--green))', stroke: 'white', strokeWidth: 2 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-purple rounded" /><span className="text-xs text-muted-foreground">Capability</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-blue-500 rounded" /><span className="text-xs text-muted-foreground">Message Fit</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-green rounded" /><span className="text-xs text-muted-foreground">Value Translation</span></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Section */}
                {dealActions.length > 0 && (() => {
                  const sortedActions = [...dealActions].sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  });
                  
                  const totalPages = Math.ceil(sortedActions.length / ACTIONS_PER_PAGE);
                  const startIndex = (actionsPage - 1) * ACTIONS_PER_PAGE;
                  const paginatedActions = sortedActions.slice(startIndex, startIndex + ACTIONS_PER_PAGE);
                  
                  const getPriorityBorderColor = (priority: string) => {
                    switch (priority) {
                      case 'high': return 'border-l-red-500';
                      case 'medium': return 'border-l-yellow-500';
                      default: return 'border-l-green-500';
                    }
                  };

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4 text-purple" />
                          Actions ({sortedActions.length})
                        </h3>
                        <Link to={`/action-hub?deal=${encodeURIComponent(deal.name)}`}>
                          <Button size="sm" className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white">
                            <Zap className="w-4 h-4" />
                            Actions
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      
                      <div className={`grid gap-3 ${isTabletCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
                        {paginatedActions.map((action) => {
                          const primaryStakeholder = stakeholders.find(s => action.stakeholderIds.includes(s.id));
                          const deadlineDate = new Date(action.deadline);
                          const formattedDeadline = `${String(deadlineDate.getMonth() + 1).padStart(2, '0')}.${String(deadlineDate.getDate()).padStart(2, '0')}`;
                          
                          return (
                            <button
                              key={action.id}
                              onClick={() => {
                                setCrossSellData(null);
                                setSelectedAction({
                                  id: action.id,
                                  stakeholderIds: action.stakeholderIds,
                                  stakeholderName: primaryStakeholder?.name || "Unknown",
                                  stakeholderRole: primaryStakeholder?.role || "Unknown",
                                  artifact: action.artifact,
                                  basedOn: action.basedOn,
                                  priority: action.priority,
                                });
                                if (action.type === 'email') {
                                  setEmailDialogOpen(true);
                                } else {
                                  setMeetingDialogOpen(true);
                                }
                              }}
                              className={`bg-card border border-border ${getPriorityBorderColor(action.priority)} border-l-[3px] rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="p-1.5 rounded bg-muted/50 shrink-0">
                                  {action.type === 'email' ? (
                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                  ) : (
                                    <Video className="w-3.5 h-3.5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1.5">
                                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-tight">{action.title}</p>
                                  <div className="flex items-center gap-2">
                                    {primaryStakeholder && (
                                      <div className="flex items-center gap-1">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage src={primaryStakeholder.avatar} alt={primaryStakeholder.name} />
                                          <AvatarFallback className="text-xxs text-white" style={{ backgroundColor: avatarColors[(primaryStakeholder.id - 1) % avatarColors.length] }}>
                                            {primaryStakeholder.name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xxs text-muted-foreground truncate max-w-[60px]">{primaryStakeholder.name.split(' ')[0]}</span>
                                      </div>
                                    )}
                                    <span className="text-xxs text-muted-foreground">{formattedDeadline}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center pt-2">
                          <Pagination>
                            <PaginationContent className="gap-1">
                              <PaginationItem>
                                <PaginationPrevious onClick={() => setActionsPage(p => Math.max(1, p - 1))} className={`h-7 text-xs ${actionsPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`} />
                              </PaginationItem>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <PaginationItem key={page}>
                                  <PaginationLink onClick={() => setActionsPage(page)} isActive={actionsPage === page} className="h-7 w-7 text-xs cursor-pointer">{page}</PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext onClick={() => setActionsPage(p => Math.min(totalPages, p + 1))} className={`h-7 text-xs ${actionsPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`} />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </CollapsibleContent>
            </section>
          </Collapsible>

              {/* Section 2: Signals & Risks - hidden in tablet compact */}
              {!isTabletCompact && (
              <SignalsRisksSection
                dealId={dealId}
                dealName={deal.name}
                isOpen={isSignalsRisksOpen}
                onToggle={() => setIsSignalsRisksOpen(!isSignalsRisksOpen)}
              />
              )}

              {/* Section 3: Recommended Offerings */}
              {!isTabletCompact && (
                <RecommendedOfferingsSection
                  isOpen={isRecommendedOfferingsOpen}
                  onToggle={() => setIsRecommendedOfferingsOpen(!isRecommendedOfferingsOpen)}
                  onCreateAction={handleCreateCrossSellAction}
                />
              )}

              {/* Section 4: Stakeholders */}
              <Collapsible open={isStakeholdersOpen} onOpenChange={setIsStakeholdersOpen}>
                <section className="space-y-4">
                  {/* Section Header Card with Engagement Indicators */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 bg-gradient-to-r from-purple/5 to-transparent border-l-4 border-l-purple cursor-pointer hover:bg-purple/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-purple/10">
                          <Users className="w-5 h-5 text-purple" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Stakeholders</h2>
                        </div>
                        {/* Engagement indicators with avatars - hide in tablet compact */}
                        {!isTabletCompact && (
                          <div className="flex items-center gap-5 ml-auto">
                            {/* Engaged */}
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-green" />
                              <span className="text-sm text-muted-foreground">Engaged</span>
                              <div className="flex -space-x-2">
                                {engagedStakeholders.slice(0, 4).map(s => (
                                  <Tooltip key={s.id}>
                                    <TooltipTrigger asChild>
                                      <Avatar 
                                        className="w-7 h-7 border-2 border-card ring-2 ring-green/30 cursor-pointer hover:scale-110 transition-transform"
                                        onClick={(e) => { e.stopPropagation(); openPopup(s); }}
                                      >
                                        <AvatarImage src={s.avatar} />
                                        <AvatarFallback className={`${getAvatarColor(s.id)} text-xs`}>
                                          {s.name.split(" ").map(n => n[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="font-medium">{s.name}</p>
                                      <p className="text-xs text-muted-foreground">{s.role}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                                {engagedStakeholders.length > 4 && (
                                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                                    +{engagedStakeholders.length - 4}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Silent */}
                            {silentStakeholders.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow" />
                                <span className="text-sm text-muted-foreground">Silent</span>
                                <div className="flex -space-x-2">
                                  {silentStakeholders.slice(0, 3).map(s => (
                                    <Tooltip key={s.id}>
                                      <TooltipTrigger asChild>
                                        <Avatar 
                                          className="w-7 h-7 border-2 border-card ring-2 ring-yellow/30 cursor-pointer hover:scale-110 transition-transform"
                                          onClick={(e) => { e.stopPropagation(); openPopup(s); }}
                                        >
                                          <AvatarImage src={s.avatar} />
                                          <AvatarFallback className={`${getAvatarColor(s.id)} text-xs`}>
                                            {s.name.split(" ").map(n => n[0]).join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">{s.role}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                  {silentStakeholders.length > 3 && (
                                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                                      +{silentStakeholders.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Hidden */}
                            {hiddenStakeholders.length > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red" />
                                <span className="text-sm text-muted-foreground">Hidden</span>
                                <div className="flex -space-x-2">
                                  {hiddenStakeholders.slice(0, 2).map(s => (
                                    <Tooltip key={s.id}>
                                      <TooltipTrigger asChild>
                                        <Avatar 
                                          className="w-7 h-7 border-2 border-card ring-2 ring-red/30 cursor-pointer hover:scale-110 transition-transform"
                                          onClick={(e) => { e.stopPropagation(); openPopup(s); }}
                                        >
                                          <AvatarImage src={s.avatar} />
                                          <AvatarFallback className={`${getAvatarColor(s.id)} text-xs`}>
                                            {s.name.split(" ").map(n => n[0]).join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="font-medium">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">{s.role}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                  {hiddenStakeholders.length > 2 && (
                                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-medium">
                                      +{hiddenStakeholders.length - 2}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {isStakeholdersOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground ml-auto" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground ml-auto" />
                        )}
                      </div>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {/* Stakeholder Cards Grid */}
                    <div className={`grid gap-4 pt-4 ${isTabletCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                      {stakeholders.map(stakeholder => (
                        <StakeholderCardExtended 
                          key={stakeholder.id} 
                          stakeholder={stakeholder}
                          deal={deal}
                          actions={dealActions.filter(a => a.stakeholderIds.includes(stakeholder.id))}
                        />
                      ))}
                    </div>
                  </CollapsibleContent>
                </section>
              </Collapsible>

              {/* Section 3: Win Path - hidden in tablet compact */}
              {!isTabletCompact && (
              <Collapsible open={isWinPathOpen} onOpenChange={setIsWinPathOpen}>
                <section className="space-y-4">
                  {/* Section Header Card */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 bg-gradient-to-r from-purple/5 to-transparent border-l-4 border-l-purple cursor-pointer hover:bg-purple/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple/10">
                          <Target className="w-5 h-5 text-purple" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-foreground">Win Path</h2>
                          <p className="text-sm text-muted-foreground">
                            Track progress through each stage of the deal lifecycle
                          </p>
                        </div>
                        {isWinPathOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground ml-auto" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground ml-auto" />
                        )}
                      </div>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <WinPathSection 
                      deal={deal} 
                      stakeholders={stakeholders}
                      winProbability={winProb}
                      alignmentScore={stakeholderAlignmentScore}
                    />
                  </CollapsibleContent>
                </section>
              </Collapsible>
              )}

              {/* Section 4: Buyer Profile - hidden in tablet compact */}
              {!isTabletCompact && (
              <Collapsible open={isBuyerProfileOpen} onOpenChange={setIsBuyerProfileOpen}>
                <section className="space-y-4">
                  {/* Section Header Card */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 bg-gradient-to-r from-orange/5 to-transparent border-l-4 border-l-orange cursor-pointer hover:bg-orange/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange/10">
                          <Target className="w-5 h-5 text-orange" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-foreground">Buyer Profile</h2>
                          <p className="text-sm text-muted-foreground">
                            BVM/SVM alignment, value drivers, and capability mapping
                          </p>
                        </div>
                        {isBuyerProfileOpen ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground ml-auto" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground ml-auto" />
                        )}
                      </div>
                    </Card>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <BuyerProfileSection dealId={dealId} />
                  </CollapsibleContent>
                </section>
              </Collapsible>
              )}

            </main>
          </Card>

          {/* AI Chat Sidebar - ONLY tablet/desktop */}
          {!isMobile && (
            <aside className={`border-l border-border bg-card flex flex-col overflow-hidden transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-0"}`}>
              {isAIPanelOpen && <AIChatPanel hideHeader />}
            </aside>
          )}
        </div>

        {/* Bottom Nav + AI Sheet - ONLY mobile */}
        {isMobile && <MobileBottomNav />}
      </div>
      
      {/* Action Dialogs */}
      <ActionEmailDialog
        open={emailDialogOpen}
        onOpenChange={(open) => {
          setEmailDialogOpen(open);
          if (!open) setCrossSellData(null);
        }}
        action={selectedAction}
        company={company?.name || deal.name}
        crossSellData={crossSellData}
      />
      <ActionMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        action={selectedAction}
        company={company?.name || deal.name}
      />
      
      {/* Alignment Intelligence Modal */}
      <AlignmentIntelligenceModal
        open={alignmentModalOpen}
        onOpenChange={setAlignmentModalOpen}
        companyName={company?.name || deal.name}
        stakeholders={stakeholders}
        overallScore={stakeholderAlignmentScore}
        capabilityPct={capabilityPct}
        messageFitPct={messageFitPct}
        valueTranslationPct={valueTranslationPct}
      />
      
      {/* Win Probability Intelligence Modal */}
      <WinProbabilityIntelligenceModal
        open={winProbModalOpen}
        onOpenChange={setWinProbModalOpen}
        companyName={company?.name || deal.name}
        stakeholders={stakeholders}
        overallScore={winProb}
        alignmentPct={alignmentPct}
        consensusPct={consensusPct}
        sentimentPct={sentimentPct}
      />
    </TooltipProvider>
  );
};

// Extended Stakeholder Card Component for Deal GPS - includes trends chart and actions
interface StakeholderCardProps {
  stakeholder: Stakeholder;
  deal: Deal;
  actions: Action[];
}

const StakeholderCardExtended = ({ stakeholder, deal, actions }: StakeholderCardProps) => {
  const [showAllActions, setShowAllActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const { openPopup } = useStakeholderPopup();
  const company = getCompanyById(deal.companyId);

  const handleActionClick = (action: Action, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedAction(action);
    if (action.type === "email") {
      setEmailDialogOpen(true);
    } else {
      setMeetingDialogOpen(true);
    }
  };

  const getActionDialogProps = () => {
    if (!selectedAction) return null;
    return {
      id: selectedAction.id,
      stakeholderName: stakeholder.name,
      stakeholderRole: stakeholder.role,
      artifact: selectedAction.title,
      basedOn: selectedAction.basedOn,
      priority: selectedAction.priority,
    };
  };
  
  const getLocalStatusColor = (status: "positive" | "neutral" | "negative") => {
    switch (status) {
      case "positive": return "bg-green/10 text-green border-green/20";
      case "neutral": return "bg-yellow/10 text-yellow border-yellow/20";
      case "negative": return "bg-red/10 text-red border-red/20";
    }
  };

  // Generate truly wavy trend data with significant variation
  const generateWavyTrends = () => {
    const numPoints = 12;
    const wavyData: { date: string; alignment: number; priority: number; sentiment: number }[] = [];
    
    // Use stakeholder's current values as anchors
    const baseAlignment = stakeholder.alignment;
    const basePriority = stakeholder.priority;
    const baseSentiment = stakeholder.sentiment;
    
    // Seed based on stakeholder ID for consistent but unique patterns
    const seed = stakeholder.id * 137;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      
      // Multiple overlapping sine waves with different frequencies create organic waves
      const wave1 = Math.sin(t * Math.PI * 4 + seed * 0.1) * 25;
      const wave2 = Math.sin(t * Math.PI * 2.5 + seed * 0.2 + 1) * 15;
      const wave3 = Math.sin(t * Math.PI * 6 + seed * 0.15) * 10;
      
      const wave4 = Math.sin(t * Math.PI * 3 + seed * 0.3 + 2) * 22;
      const wave5 = Math.sin(t * Math.PI * 5 + seed * 0.25) * 12;
      const wave6 = Math.sin(t * Math.PI * 2 + seed * 0.35 + 0.5) * 18;
      
      const wave7 = Math.sin(t * Math.PI * 3.5 + seed * 0.4 + 1.5) * 20;
      const wave8 = Math.sin(t * Math.PI * 4.5 + seed * 0.45) * 14;
      const wave9 = Math.sin(t * Math.PI * 2.8 + seed * 0.5 + 2.5) * 16;
      
      // Combine waves and clamp to valid range
      const alignmentVal = Math.round(Math.max(20, Math.min(95, baseAlignment + wave1 + wave2 + wave3)));
      const priorityVal = Math.round(Math.max(20, Math.min(95, basePriority + wave4 + wave5 + wave6)));
      const sentimentVal = Math.round(Math.max(20, Math.min(95, baseSentiment + wave7 + wave8 + wave9)));
      
      wavyData.push({
        date: i === numPoints - 1 ? 'Now' : '',
        alignment: alignmentVal,
        priority: priorityVal,
        sentiment: sentimentVal,
      });
    }
    
    return wavyData;
  };
  
  const trendsData = generateWavyTrends();

  // Show first 2 actions, more on expand
  const visibleActions = showAllActions ? actions : actions.slice(0, 2);
  const hasMoreActions = actions.length > 2;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 ease-out hover:shadow-lg hover:shadow-purple/10 hover:border-purple/40 hover:-translate-y-0.5">
      {/* Subtle glow effect on hover */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-purple/20 via-primary/10 to-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
      
      <div 
        className="p-4 space-y-3 cursor-pointer"
        onClick={() => openPopup(stakeholder)}
      >
        {/* Header - same as base StakeholderCard */}
        <div className="flex items-center gap-3">
          <Avatar 
            className="w-9 h-9 transition-all duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-purple/30 group-hover:ring-offset-2 group-hover:ring-offset-card"
          >
            <AvatarImage src={stakeholder.avatar} />
            <AvatarFallback className={`${getAvatarColor(stakeholder.id)} text-xs font-medium`}>
              {stakeholder.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate transition-colors duration-200 group-hover:text-purple">
              {stakeholder.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{stakeholder.role}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium border transition-all duration-200 group-hover:scale-105 ${getLocalStatusColor(stakeholder.status)}`}>
            {stakeholder.status}
          </span>
        </div>

        {/* Progress Bars - Priority > Sentiment > Engagement */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">Priority</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(stakeholder.priority)} transition-all duration-500`}
                style={{ width: `${stakeholder.priority}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8 text-right">{stakeholder.priority}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">Sentiment</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(stakeholder.sentiment)} transition-all duration-500`}
                style={{ width: `${stakeholder.sentiment}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8 text-right">{stakeholder.sentiment}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20">Engagement</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(stakeholder.engagement)} transition-all duration-500`}
                style={{ width: `${stakeholder.engagement}%` }}
              />
            </div>
            <span className="text-xs font-medium w-8 text-right">{stakeholder.engagement}%</span>
          </div>
        </div>

        {/* Focus Area Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {getPrimitivesForRole(stakeholder.role).slice(0, 3).map((p) => {
            const primitive = getPrimitiveById(p.primitiveId);
            if (!primitive) return null;
            const pillStyles = p.weight > 70 
              ? 'bg-purple text-white' 
              : p.weight >= 40 
                ? 'bg-purple/20 text-foreground' 
                : 'bg-muted text-muted-foreground';
            return (
              <span key={p.primitiveId} className={`px-2 py-0.5 rounded-full text-xs font-medium ${pillStyles}`}>
                {primitive.shortLabel}
              </span>
            );
          })}
        </div>

        {/* Extended: Trend Chart */}
        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">Trend</p>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData}>
                <defs>
                  <linearGradient id={`gradSHAlign${stakeholder.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--purple))" stopOpacity={0.5}/>
                    <stop offset="50%" stopColor="hsl(var(--purple))" stopOpacity={0.25}/>
                    <stop offset="100%" stopColor="hsl(var(--purple))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id={`gradSHPriority${stakeholder.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--yellow))" stopOpacity={0.5}/>
                    <stop offset="50%" stopColor="hsl(var(--yellow))" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="hsl(var(--yellow))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id={`gradSHSentiment${stakeholder.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.45}/>
                    <stop offset="50%" stopColor="#ec4899" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05}/>
                  </linearGradient>
                  <filter id={`shGlow${stakeholder.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur"/>
                    <feMerge>
                      <feMergeNode in="blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                    padding: '6px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }} 
                />
                <Area 
                  type="natural" 
                  dataKey="alignment" 
                  name="Alignment"
                  stroke="hsl(var(--purple))" 
                  strokeWidth={2} 
                  fill={`url(#gradSHAlign${stakeholder.id})`}
                  dot={false}
                  filter={`url(#shGlow${stakeholder.id})`}
                />
                <Area 
                  type="natural" 
                  dataKey="priority" 
                  name="Priority"
                  stroke="hsl(var(--yellow))" 
                  strokeWidth={1.5} 
                  fill={`url(#gradSHPriority${stakeholder.id})`}
                  dot={false}
                />
                <Area 
                  type="natural" 
                  dataKey="sentiment" 
                  name="Sentiment"
                  stroke="#ec4899" 
                  strokeWidth={1.5} 
                  fill={`url(#gradSHSentiment${stakeholder.id})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-purple rounded" />
              <span className="text-xxs text-muted-foreground">Alignment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-yellow rounded" />
              <span className="text-xxs text-muted-foreground">Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-pink-500 rounded" />
              <span className="text-xxs text-muted-foreground">Sentiment</span>
            </div>
          </div>
        </div>
      </div>

        {/* Extended: Actions - outside clickable area */}
        {actions.length > 0 && (
          <div className="border-t border-border pt-3 pb-4 px-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</p>
            <div className="space-y-1.5">
              {visibleActions.map(action => {
                const borderColor = action.priority === 'high' ? 'border-l-red' : action.priority === 'medium' ? 'border-l-yellow' : 'border-l-muted-foreground';
                return (
                  <button 
                    key={action.id}
                    onClick={(e) => handleActionClick(action, e)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border hover:bg-purple/10 hover:border-purple/30 border-l-[3px] ${borderColor} transition-all group w-full text-left`}
                  >
                    <span className="text-xs text-foreground truncate flex-1 group-hover:text-purple transition-colors">{action.title}</span>
                    {action.type === "email" ? (
                      <Mail className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple shrink-0" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple shrink-0" />
                    )}
                  </button>
                );
              })}
              {hasMoreActions && !showAllActions && (
                <button 
                  onClick={() => setShowAllActions(true)}
                  className="flex items-center gap-1.5 text-xs text-purple hover:text-purple/80 font-medium"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  +{actions.length - 2} more
                </button>
              )}
            </div>
          </div>
        )}

      {/* Action Dialogs */}
      <ActionEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        action={getActionDialogProps()}
        company={company?.name || deal.name}
        companyLogo={company?.logo || ''}
      />
      <ActionMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        action={getActionDialogProps()}
        company={company?.name || deal.name}
        companyLogo={company?.logo || ''}
      />
    </Card>
  );
};

export default DealGPS;
