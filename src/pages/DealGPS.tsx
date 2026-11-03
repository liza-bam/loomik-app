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


import { deals, getDealById, getStakeholdersForDeal, getActionsForDeal, stageConfig, getCompanyById, type Deal, type Stakeholder, type Action, formatCompactValue } from "@/data/dealData";
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
import { scoreText, scoreColor, trendText, sentimentBadge, priorityDot, categoryBadge, avatarFallback, selectedChip, chartTooltip, chartTick } from "@/lib/tone";
import Logo from "@/components/Logo";

// Format value as compact currency ($580K, $2.4M)
// Format date as MM.DD.YY
// Compact score gauge: a ring filled to the score, number in the middle
const ScoreRing = ({ value }: { value: number }) => (
  <div className="w-20 h-20 rounded-full p-1.5" style={{ background: `conic-gradient(${scoreColor(value)} ${value}%, hsl(var(--muted)) 0)` }}>
    <div className={`w-full h-full rounded-full bg-card flex items-center justify-center font-bold text-xl ${scoreText(value)}`}>{value}%</div>
  </div>
);

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
  // Compact layout on phones, and on tablets when the AI panel is open
  const isCompact = isMobile || (isTablet && isAIPanelOpen);
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
      <span className={`${textSize} font-medium ${trendText(value)}`}>
        {isPositive ? "↑" : "↓"}{Math.abs(value)}%
      </span>
    );
  };

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-background bg-canvas bg-cover overflow-hidden">
        {/* Header - hides on scroll */}
        <div className={`transition-all duration-200 ${isScrolled ? "h-0 opacity-0 overflow-hidden" : ""}`}>
          <Header isScrolled={isScrolled} />
        </div>
        
        {/* Tab Navigation + AI Header - side by side */}
        <div className="flex border-b border-border bg-card">
          <div className="flex-1">
            <TabNavigation isScrolled={isScrolled} activeTab="Deal GPS" />
          </div>
          
          {/* AI Header - collapsible toggle - ONLY tablet/desktop */}
          {!isMobile && (
            <div className={`flex items-center gap-2 px-2 md:px-4 border-l border-border transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-10 md:w-12"}`}>
              {isAIPanelOpen && (
                <>
                  <Logo className="h-4 md:h-5" />
                  <div className="w-2 h-2 bg-success rounded-full" />
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

        <div className="flex flex-1 overflow-hidden">
          {/* Left column: Deal Tab Bar + Main Content */}
          <div className={`flex-1 flex overflow-hidden p-6 ${isMobile ? 'pb-20' : ''}`}>
          <Card className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Unified Deal Header */}
            <div className={`p-4 border-b border-border shrink-0 ${isCompact ? 'space-y-2' : 'flex items-center justify-between'}`}>
              {/* Row 1: Avatar + Deal Name + Company (+ Stage for tablet compact) */}
              <div className="flex items-center gap-3">
                <Avatar className={`${isCompact ? 'w-8 h-8' : 'w-10 h-10'}`}>
                  <AvatarImage src={company?.logo} alt={company?.name} className="object-contain p-1" />
                  <AvatarFallback className="text-sm font-semibold">{company?.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <Select value={dealId.toString()} onValueChange={(value) => handleDealChange(parseInt(value))}>
                  <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto focus:ring-0 gap-2">
                    <span className={`font-semibold ${isCompact ? 'text-base' : 'text-lg'}`}>{deal.name}</span>
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
                              <div className="w-2 h-2 bg-danger rounded-full" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {!isCompact && <span className="text-xs text-muted-foreground">({company?.name})</span>}
                {!isCompact && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border cursor-help ${stageInfo.colorClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dotColor}`} />
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
                {isCompact && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border cursor-help ${stageInfo.colorClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stageInfo.dotColor}`} />
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
                {!isCompact && (
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
            <main id="main-scroll" className="flex-1 overflow-y-auto px-6 pt-6 pb-20 space-y-6">
              {/* Section 1: Win Probability */}
              <Collapsible open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
                <section className="space-y-4">
                  {/* Section Header Card */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-subtle">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-foreground">Win Probability</h2>
                          {!isCompact && (
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
                    <Sparkles className="w-4 h-4 text-primary" />
                    Summary
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-base text-foreground leading-relaxed">
                      {deal.summary.context} The deal has progressed through {deal.stage === 'diagnose' ? 'discovery phase' : deal.stage === 'validate' ? 'validation stage' : deal.stage === 'align' ? 'alignment phase' : 'closing stage'} with {engagedStakeholders.length} actively engaged stakeholders.{silentStakeholders.length > 0 ? ` ${silentStakeholders.length} stakeholder${silentStakeholders.length > 1 ? 's remain' : ' remains'} silent and may need re-engagement.` : ' All stakeholders are actively participating.'}
                    </p>
                  </div>
                </div>

                {/* Two Analysis Cards */}
                <div className={`${isCompact ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-5'}`}>
                  {/* Win Probability Analysis Card */}
                  {isCompact ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground text-sm">Win Probability</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        {/* Score Badge (Top) */}
                        <ScoreRing value={winProb} />
                        
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
                                <span className={`font-medium ${scoreText(m.value)}`}>{m.value}%</span>
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
                      className="group cursor-pointer rounded-xl transition-shadow p-5 space-y-5 border border-border bg-card hover:bg-muted/30 hover:shadow-md"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setWinProbModalOpen(true)}
                    >
                      <div className="flex items-center justify-between pointer-events-none">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Win Probability
                        </h3>
                      </div>
                      
                      {/* Donut + Score Bars Group */}
                      <div className="bg-muted/20 rounded-xl p-5 pointer-events-none">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-24 h-24 shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={pieData} cx="50%" cy="50%" startAngle={90} endAngle={-270} innerRadius={38} outerRadius={46} paddingAngle={2} dataKey="value" stroke="none">
                                    <Cell fill={scoreColor(winProb)} />
                                    <Cell fill="hsl(var(--muted))" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xl font-bold ${scoreText(winProb)}`}>{winProb}%</span>
                              </div>
                            </div>
                            <TrendIndicator value={winProbTrend} size="md" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Alignment</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${scoreText(alignmentPct)}`}>{alignmentPct}%</span>
                                <TrendIndicator value={alignmentTrend} size="sm" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Consensus</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${scoreText(consensusPct)}`}>{consensusPct}%</span>
                                <TrendIndicator value={consensusTrend} size="sm" />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sentiment</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${scoreText(sentimentPct)}`}>{sentimentPct}%</span>
                                <TrendIndicator value={sentimentTrend} size="sm" />
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
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis dataKey="date" tick={chartTick} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                              <YAxis hide domain={[0, 100]} />
                              <RechartsTooltip contentStyle={chartTooltip} />
                              <Area type="natural" dataKey="alignment" name="Alignment" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--chart-1))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                              <Area type="natural" dataKey="consensus" name="Consensus" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--chart-2))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                              <Area type="natural" dataKey="sentiment" name="Sentiment" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--chart-3))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-chart-1 rounded" /><span className="text-xs text-muted-foreground">Alignment</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-chart-2 rounded" /><span className="text-xs text-muted-foreground">Consensus</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-chart-3 rounded" /><span className="text-xs text-muted-foreground">Sentiment</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stakeholder Alignment Card */}
                  {isCompact ? (
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground text-sm">Alignment</span>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        {/* Score Badge (Top) */}
                        <ScoreRing value={stakeholderAlignmentScore} />
                        
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
                                <span className={`font-medium ${scoreText(m.value)}`}>{m.value}%</span>
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
                      className="group cursor-pointer rounded-xl transition-shadow p-5 space-y-5 border border-border bg-card hover:bg-muted/30 hover:shadow-md"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setAlignmentModalOpen(true)}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between pointer-events-none">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Alignment
                        </h3>
                        {stakeholderAlignment.isGuardrailActive && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-warning-subtle rounded-full text-xs font-medium text-warning">
                            <div className="w-2 h-2 bg-warning rounded-full" />
                            {stakeholderPrimaryRisk && STAKEHOLDER_METRIC_LABELS[stakeholderPrimaryRisk]} Risk
                          </div>
                        )}
                      </div>
                      
                      {/* Donut + Score Bars Group */}
                      <div className="bg-muted/20 rounded-xl p-5 pointer-events-none">
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center gap-2">
                            <div className="relative w-24 h-24 shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={[{ name: "Alignment", value: stakeholderAlignmentScore }, { name: "Remaining", value: 100 - stakeholderAlignmentScore }]} cx="50%" cy="50%" startAngle={90} endAngle={-270} innerRadius={38} outerRadius={46} paddingAngle={2} dataKey="value" stroke="none">
                                    <Cell fill={scoreColor(stakeholderAlignmentScore)} />
                                    <Cell fill="hsl(var(--muted))" />
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xl font-bold ${scoreText(stakeholderAlignmentScore)}`}>{stakeholderAlignmentScore}%</span>
                              </div>
                            </div>
                            <TrendIndicator value={stakeholderAlignmentTrend} size="md" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">Capability<Info className="w-3 h-3 opacity-60" /></span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${scoreText(capabilityPct)}`}>{capabilityPct}%</span>
                                  <TrendIndicator value={capabilityTrend} size="sm" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">Message Fit<Info className="w-3 h-3 opacity-60" /></span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${scoreText(messageFitPct)}`}>{messageFitPct}%</span>
                                  <TrendIndicator value={messageFitTrend} size="sm" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground flex items-center gap-1">Value Translation<Info className="w-3 h-3 opacity-60" /></span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-semibold ${scoreText(valueTranslationPct)}`}>{valueTranslationPct}%</span>
                                  <TrendIndicator value={valueTranslationTrend} size="sm" />
                                </div>
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
                            <AreaChart data={alignmentTrendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                              <XAxis dataKey="date" tick={chartTick} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                              <YAxis hide domain={[0, 100]} />
                              <RechartsTooltip contentStyle={chartTooltip} />
                              <Area type="natural" dataKey="capability" name="Capability" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--chart-1))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                              <Area type="natural" dataKey="messageFit" name="Message Fit" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--chart-2))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                              <Area type="natural" dataKey="valueTranslation" name="Value Translation" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="none" dot={false} activeDot={{ r: 5, fill: 'hsl(var(--chart-3))', stroke: 'hsl(var(--card))', strokeWidth: 2 }} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-chart-1 rounded" /><span className="text-xs text-muted-foreground">Capability</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-chart-2 rounded" /><span className="text-xs text-muted-foreground">Message Fit</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-chart-3 rounded" /><span className="text-xs text-muted-foreground">Value Translation</span></div>
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
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          Actions ({sortedActions.length})
                        </h3>
                        <Link to={`/action-hub?deal=${encodeURIComponent(deal.name)}`}>
                          <Button size="sm">
                            <Zap className="w-4 h-4" />
                            Actions
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                      
                      <div className={`grid gap-3 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'}`}>
                        {paginatedActions.map((action) => {
                          const primaryStakeholder = stakeholders.find(s => action.stakeholderIds.includes(s.id));
                          
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
                              className="bg-card border border-border rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group"
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
                                          <AvatarFallback className={`${avatarFallback} text-xxs`}>
                                            {primaryStakeholder.name.split(' ').map(n => n[0]).join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-xxs text-muted-foreground truncate max-w-15">{primaryStakeholder.name.split(' ')[0]}</span>
                                      </div>
                                    )}
                                    <span className="text-xxs text-muted-foreground">{action.deadline}</span>
                                    <span className={`w-1.5 h-1.5 rounded-full ml-auto shrink-0 ${priorityDot(action.priority)}`} title={`${action.priority} priority`} />
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
              {!isCompact && (
              <SignalsRisksSection
                dealId={dealId}
                dealName={deal.name}
                isOpen={isSignalsRisksOpen}
                onToggle={() => setIsSignalsRisksOpen(!isSignalsRisksOpen)}
              />
              )}

              {/* Section 3: Recommended Offerings */}
              {!isCompact && (
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
                    <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary-subtle">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">Stakeholders</h2>
                        </div>
                        {/* Engagement indicators with avatars - hide in tablet compact */}
                        {!isCompact && (
                          <div className="flex items-center gap-5 ml-auto">
                            {/* Engaged */}
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-success" />
                              <span className="text-sm text-muted-foreground">Engaged</span>
                              <div className="flex -space-x-2">
                                {engagedStakeholders.slice(0, 4).map(s => (
                                  <Tooltip key={s.id}>
                                    <TooltipTrigger asChild>
                                      <Avatar 
                                        className="w-7 h-7 border-2 border-card cursor-pointer hover:scale-110 transition-transform"
                                        onClick={(e) => { e.stopPropagation(); openPopup(s); }}
                                      >
                                        <AvatarImage src={s.avatar} />
                                        <AvatarFallback className={`${avatarFallback} text-xs`}>
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
                                <div className="w-2.5 h-2.5 rounded-full bg-warning" />
                                <span className="text-sm text-muted-foreground">Silent</span>
                                <div className="flex -space-x-2">
                                  {silentStakeholders.slice(0, 3).map(s => (
                                    <Tooltip key={s.id}>
                                      <TooltipTrigger asChild>
                                        <Avatar 
                                          className="w-7 h-7 border-2 border-card cursor-pointer hover:scale-110 transition-transform"
                                          onClick={(e) => { e.stopPropagation(); openPopup(s); }}
                                        >
                                          <AvatarImage src={s.avatar} />
                                          <AvatarFallback className={`${avatarFallback} text-xs`}>
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
                                <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                                <span className="text-sm text-muted-foreground">Hidden</span>
                                <div className="flex -space-x-2">
                                  {hiddenStakeholders.slice(0, 2).map(s => (
                                    <Tooltip key={s.id}>
                                      <TooltipTrigger asChild>
                                        <Avatar 
                                          className="w-7 h-7 border-2 border-card cursor-pointer hover:scale-110 transition-transform"
                                          onClick={(e) => { e.stopPropagation(); openPopup(s); }}
                                        >
                                          <AvatarImage src={s.avatar} />
                                          <AvatarFallback className={`${avatarFallback} text-xs`}>
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
                    <div className={`grid gap-4 pt-4 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
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
              {!isCompact && (
              <Collapsible open={isWinPathOpen} onOpenChange={setIsWinPathOpen}>
                <section className="space-y-4">
                  {/* Section Header Card */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-subtle">
                          <Target className="w-5 h-5 text-primary" />
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
              {!isCompact && (
              <Collapsible open={isBuyerProfileOpen} onOpenChange={setIsBuyerProfileOpen}>
                <section className="space-y-4">
                  {/* Section Header Card */}
                  <CollapsibleTrigger asChild>
                    <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-subtle">
                          <Target className="w-5 h-5 text-primary" />
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
          </div>

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
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <div 
        className="p-4 space-y-3 cursor-pointer"
        onClick={() => openPopup(stakeholder)}
      >
        {/* Header - same as base StakeholderCard */}
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={stakeholder.avatar} />
            <AvatarFallback className={`${avatarFallback} text-xs font-medium`}>
              {stakeholder.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground text-sm truncate transition-colors group-hover:text-primary">
              {stakeholder.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{stakeholder.role}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${sentimentBadge(stakeholder.status)}`}>
            {stakeholder.status}
          </span>
        </div>

        {/* Scores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Priority</span>
            <span className={`text-xs font-semibold ${scoreText(stakeholder.priority)}`}>{stakeholder.priority}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Sentiment</span>
            <span className={`text-xs font-semibold ${scoreText(stakeholder.sentiment)}`}>{stakeholder.sentiment}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Engagement</span>
            <span className={`text-xs font-semibold ${scoreText(stakeholder.engagement)}`}>{stakeholder.engagement}%</span>
          </div>
        </div>

        {/* Focus Area Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {getPrimitivesForRole(stakeholder.role).slice(0, 3).map((p) => {
            const primitive = getPrimitiveById(p.primitiveId);
            if (!primitive) return null;
            const pillStyles = p.weight > 70 ? selectedChip : categoryBadge;
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
                <XAxis 
                  dataKey="date" 
                  tick={chartTick} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <RechartsTooltip 
                  contentStyle={chartTooltip} 
                />
                <Area 
                  type="natural" 
                  dataKey="alignment" 
                  name="Alignment"
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2} 
                  fill="none"
                  dot={false}
                />
                <Area 
                  type="natural" 
                  dataKey="priority" 
                  name="Priority"
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={1.5} 
                  fill="none"
                  dot={false}
                />
                <Area 
                  type="natural" 
                  dataKey="sentiment" 
                  name="Sentiment"
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={1.5} 
                  fill="none"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-chart-1 rounded" />
              <span className="text-xxs text-muted-foreground">Alignment</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-chart-2 rounded" />
              <span className="text-xxs text-muted-foreground">Priority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-chart-3 rounded" />
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
                return (
                  <button 
                    key={action.id}
                    onClick={(e) => handleActionClick(action, e)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors group w-full text-left"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(action.priority)}`} />
                    <span className="text-xs text-foreground truncate flex-1 group-hover:text-primary transition-colors">{action.title}</span>
                    {action.type === "email" ? (
                      <Mail className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    ) : (
                      <Video className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
              {hasMoreActions && !showAllActions && (
                <button 
                  onClick={() => setShowAllActions(true)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium"
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
