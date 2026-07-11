// Buyer Profile Section - BVM/SVM details, alignment status, and supporting proof
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  Pencil, 
  Upload, 
  Filter, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Tag,
  FileText,
  Layers,
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BuyerProfileSectionProps {
  dealId: number;
}

// Sample data for BVM-SVM Alignment
const alignmentData = [
  {
    id: 1,
    bvmField: "Problem Statement",
    bvmDescription: "Verbatim buyer pain",
    svmField: "Primary Benefit Primitive",
    svmDescription: "Hero primitive",
    score: 85,
    status: "aligned" as const,
    gapAnalysis: "Strong alignment - buyer's attribution problem directly addressed by risk mitigation capability",
    recommendation: "Emphasize risk mitigation in messaging and case studies"
  },
  {
    id: 2,
    bvmField: "Business Impact",
    bvmDescription: "Qual & Quant combined",
    svmField: "ROI Evidence type",
    svmDescription: "Quantitative vs qualitative proof",
    score: 90,
    status: "aligned" as const,
    gapAnalysis: "Perfect match - quantitative evidence aligns with buyer's need for measurable impact",
    recommendation: "Lead with quantitative ROI data and cost savings metrics"
  },
  {
    id: 3,
    bvmField: "Primitive Tags",
    bvmDescription: "Primitives with weights",
    svmField: "Primitive Strength (0-3)",
    svmDescription: "Lead level",
    score: 75,
    status: "partial" as const,
    gapAnalysis: "Good alignment on data insight (strength 3), but revenue growth capability needs strengthening",
    recommendation: "Develop additional revenue growth features or messaging"
  },
  {
    id: 4,
    bvmField: "Current State Sentiment",
    bvmDescription: "Aggregate tone score",
    svmField: "Case Study IDs",
    svmDescription: "Reference to success stories",
    score: 60,
    status: "partial" as const,
    gapAnalysis: "Positive sentiment supported by case studies, but may need more recent success stories",
    recommendation: "Gather fresh case studies from similar companies to boost confidence"
  },
  {
    id: 5,
    bvmField: "Priority Level",
    bvmDescription: "1-5 urgency",
    svmField: "Deployment Mode",
    svmDescription: "SaaS/On-prem/Hybrid",
    score: 80,
    status: "aligned" as const,
    gapAnalysis: "High priority aligns with flexible deployment options",
    recommendation: "Highlight rapid deployment capabilities for urgent needs"
  },
  {
    id: 6,
    bvmField: "Decision Maker Influence",
    bvmDescription: "Power and interest mapping",
    svmField: "ICP Segment Tags",
    svmDescription: "Vertical sweet spot",
    score: 70,
    status: "partial" as const,
    gapAnalysis: "CEO engagement good, but need to verify FinServ-Mid segment matches buyer's industry",
    recommendation: "Confirm industry alignment and prepare CEO-level messaging"
  },
  {
    id: 7,
    bvmField: "Revenue Impact",
    bvmDescription: "Direct revenue contribution",
    svmField: "Feature Set",
    svmDescription: "Complete feature inventory",
    score: 65,
    status: "partial" as const,
    gapAnalysis: "Features support security but may not directly address conversion optimization",
    recommendation: "Develop conversion tracking features or partner with analytics tools"
  },
  {
    id: 8,
    bvmField: "Cost Reduction",
    bvmDescription: "Operational efficiency gains",
    svmField: "Integration Capabilities",
    svmDescription: "Third-party integrations",
    score: 95,
    status: "aligned" as const,
    gapAnalysis: "Excellent alignment - integrations directly enable operational efficiency",
    recommendation: "Emphasize integration benefits and automation capabilities"
  },
  {
    id: 9,
    bvmField: "Risk Mitigation",
    bvmDescription: "Compliance and security benefits",
    svmField: "Compliance Certifications",
    svmDescription: "Security and compliance standards",
    score: 100,
    status: "aligned" as const,
    gapAnalysis: "Perfect alignment - exact compliance match",
    recommendation: "Lead with compliance story and audit reduction benefits"
  },
  {
    id: 10,
    bvmField: "Timeline Expectations",
    bvmDescription: "Deployment schedule",
    svmField: "Implementation Timeline",
    svmDescription: "Deployment schedule",
    score: 85,
    status: "aligned" as const,
    gapAnalysis: "Timeline alignment is good - seller can meet buyer's Q1 deadline",
    recommendation: "Confirm timeline feasibility and prepare implementation plan"
  },
  {
    id: 11,
    bvmField: "Resource Requirements",
    bvmDescription: "Internal team needs",
    svmField: "Support Level",
    svmDescription: "Customer support tiers",
    score: 55,
    status: "gap" as const,
    gapAnalysis: "Resource requirements not directly addressed by support offerings",
    recommendation: "Develop professional services or training programs for internal teams"
  },
  {
    id: 12,
    bvmField: "KPIs & Measurement",
    bvmDescription: "How success will be measured",
    svmField: "Scalability Metrics",
    svmDescription: "Growth capacity indicators",
    score: 40,
    status: "gap" as const,
    gapAnalysis: "Scalability metrics don't directly address attribution accuracy measurement",
    recommendation: "Develop attribution accuracy measurement tools or partnerships"
  }
];

// Sample data for Buyer Value Map
const bvmData = [
  { id: 1, category: "Core BVM", categoryColor: "green", field: "Problem Statement", description: "Verbatim buyer pain" },
  { id: 2, category: "Core BVM", categoryColor: "green", field: "Business Impact", description: "Qual & Quant combined" },
  { id: 3, category: "Core BVM", categoryColor: "green", field: "Primitive Tags", description: "Primitives with weights" },
  { id: 4, category: "Core BVM", categoryColor: "green", field: "Current State Sentiment", description: "Aggregate tone score" },
  { id: 5, category: "Core BVM", categoryColor: "green", field: "Priority Level", description: "1-5 urgency" },
  { id: 6, category: "Stakeholder Analysis", categoryColor: "blue", field: "Decision Maker Influence", description: "Power and interest mapping" },
  { id: 7, category: "Stakeholder Analysis", categoryColor: "blue", field: "Champion Identification", description: "Internal advocates" },
  { id: 8, category: "Stakeholder Analysis", categoryColor: "blue", field: "Blockers & Concerns", description: "Risk factors and objections" },
  { id: 9, category: "Value Drivers", categoryColor: "blue", field: "Revenue Impact", description: "Direct revenue contribution" },
  { id: 10, category: "Value Drivers", categoryColor: "blue", field: "Cost Reduction", description: "Operational efficiency gains" },
  { id: 11, category: "Value Drivers", categoryColor: "blue", field: "Risk Mitigation", description: "Compliance and security benefits" },
  { id: 12, category: "Value Drivers", categoryColor: "blue", field: "Competitive Advantage", description: "Market differentiation" },
  { id: 13, category: "Implementation", categoryColor: "yellow", field: "Timeline Expectations", description: "Deployment schedule" },
  { id: 14, category: "Implementation", categoryColor: "yellow", field: "Resource Requirements", description: "Internal team needs" },
  { id: 15, category: "Implementation", categoryColor: "yellow", field: "Integration Complexity", description: "Technical implementation effort" },
  { id: 16, category: "Success Metrics", categoryColor: "red", field: "KPIs & Measurement", description: "How success will be measured" },
  { id: 17, category: "Success Metrics", categoryColor: "red", field: "ROI Projection", description: "Expected return on investment" },
  { id: 18, category: "Success Metrics", categoryColor: "red", field: "Success Criteria", description: "Definition of project success" }
];

// Sample data for Seller Value Map
const svmData = [
  { id: 1, field: "Capability ID/Name", description: "Unique identifier/short label", whyNeeded: "join key + human label", mappedBvm: [] },
  { id: 2, field: "Primary Benefit Primitive", description: "Hero primitive", whyNeeded: "Top feature to buyer primitive match", mappedBvm: ["Primitive Tags"] },
  { id: 3, field: "Primitive Strength (0-3)", description: "Lead level", whyNeeded: "Weighting factor in alignment", mappedBvm: ["BVM Primitive Strength"] },
  { id: 4, field: "Deployment Mode", description: "SaaS/On-prem/Hybrid", whyNeeded: "To match buyer tech requirements", mappedBvm: ["BVM Integration Constraints"] },
  { id: 5, field: "ICP Segment Tags", description: "Vertical sweet spot", whyNeeded: "quick filter for relevance", mappedBvm: ["BVM Company Industry"] },
  { id: 6, field: "Case Study IDs", description: "Reference to success stories", whyNeeded: "proof-strength multiplier", mappedBvm: ["BVM business impact"] },
  { id: 7, field: "ROI Evidence type", description: "Quantitative vs qualitative proof", whyNeeded: "quant vs qual proof alignment", mappedBvm: ["BVM business impact quant"] }
];

const ITEMS_PER_PAGE = 5;

export function BuyerProfileSection({ dealId }: BuyerProfileSectionProps) {
  // Pagination states
  const [alignmentPage, setAlignmentPage] = useState(1);
  const [bvmPage, setBvmPage] = useState(1);
  const [svmPage, setSvmPage] = useState(1);
  
  // Filter states
  const [alignmentFilter, setAlignmentFilter] = useState("all");
  const [bvmFilter, setBvmFilter] = useState("all");
  const [svmFilter, setSvmFilter] = useState("all");
  const [svmViewMode, setSvmViewMode] = useState<"deal" | "full">("deal");
  
  // Calculate alignment stats
  const alignedCount = alignmentData.filter(a => a.status === "aligned").length;
  const gapCount = alignmentData.filter(a => a.status === "gap").length;
  const overallAlignment = Math.round(alignmentData.reduce((sum, a) => sum + a.score, 0) / alignmentData.length);
  
  // Filter alignment data
  const filteredAlignmentData = alignmentFilter === "all" 
    ? alignmentData 
    : alignmentData.filter(a => a.status === alignmentFilter);
  
  // Paginate alignment data
  const alignmentTotalPages = Math.ceil(filteredAlignmentData.length / ITEMS_PER_PAGE);
  const paginatedAlignmentData = filteredAlignmentData.slice(
    (alignmentPage - 1) * ITEMS_PER_PAGE,
    alignmentPage * ITEMS_PER_PAGE
  );
  
  // Filter BVM data
  const bvmCategories = [...new Set(bvmData.map(b => b.category))];
  const filteredBvmData = bvmFilter === "all"
    ? bvmData
    : bvmData.filter(b => b.category === bvmFilter);
  
  // Paginate BVM data
  const bvmTotalPages = Math.ceil(filteredBvmData.length / ITEMS_PER_PAGE);
  const paginatedBvmData = filteredBvmData.slice(
    (bvmPage - 1) * ITEMS_PER_PAGE,
    bvmPage * ITEMS_PER_PAGE
  );
  
  // Paginate SVM data
  const svmTotalPages = Math.ceil(svmData.length / ITEMS_PER_PAGE);
  const paginatedSvmData = svmData.slice(
    (svmPage - 1) * ITEMS_PER_PAGE,
    svmPage * ITEMS_PER_PAGE
  );
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-gradient-to-r from-green to-green/80";
    if (score >= 60) return "bg-gradient-to-r from-orange to-yellow-500";
    return "bg-gradient-to-r from-red to-red/80";
  };
  
  const getStatusBadge = (status: "aligned" | "partial" | "gap") => {
    switch (status) {
      case "aligned":
        return (
          <Badge className="bg-green/10 text-green border-green/20 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            aligned
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-orange/10 text-orange border-orange/20 gap-1">
            <TrendingUp className="w-3 h-3" />
            partial
          </Badge>
        );
      case "gap":
        return (
          <Badge className="bg-red/10 text-red border-red/20 gap-1">
            <AlertTriangle className="w-3 h-3" />
            gap
          </Badge>
        );
    }
  };
  
  const getCategoryDotColor = (color: string) => {
    switch (color) {
      case "green": return "bg-green";
      case "blue": return "bg-blue-500";
      case "yellow": return "bg-yellow-500";
      case "red": return "bg-red";
      default: return "bg-muted-foreground";
    }
  };
  
  const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalItems, 
    onPageChange,
    itemsPerPage = ITEMS_PER_PAGE
  }: { 
    currentPage: number; 
    totalPages: number; 
    totalItems: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
  }) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <span className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} entries
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                "w-8 h-8 p-0",
                page === currentPage && "bg-foreground text-background"
              )}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Box - matches Win Probability style */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple" />
          Summary
        </h3>
        <div className="bg-muted/30 rounded-lg p-4 flex items-center justify-between">
          <p className="text-base text-foreground leading-relaxed">
            Review and manage BVM/SVM details, alignment status, and supporting proof.
          </p>
          <Button size="sm" className="bg-orange hover:bg-orange/90 text-white gap-2 shrink-0 ml-4">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>
      
      {/* BVM-SVM Alignment Analysis */}
      <Card className="overflow-hidden">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">BVM-SVM Alignment Analysis</h3>
              <p className="text-sm text-muted-foreground">Buyer Value Map to Seller Value Map alignment and gap analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={alignmentFilter} onValueChange={setAlignmentFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Alignments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alignments</SelectItem>
                  <SelectItem value="aligned">Aligned</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="gap">Gaps</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9" title="Refresh Analysis">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="bg-purple/10 text-purple border-purple/20">
              Overall Alignment: {overallAlignment}%
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
              {alignedCount} Aligned
            </Badge>
            <Badge variant="outline" className="bg-red/10 text-red border-red/20">
              {gapCount} Gaps
            </Badge>
          </div>
        </div>
        
        {/* Alignment Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">BVM Field</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">SVM Field</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Alignment Score</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Gap Analysis</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAlignmentData.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.status === "aligned" ? "bg-green" : item.status === "partial" ? "bg-yellow-500" : "bg-red"
                      )} />
                      <div>
                        <p className="text-sm font-medium">{item.bvmField}</p>
                        <p className="text-xs text-muted-foreground">{item.bvmDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{item.svmField}</p>
                      <p className="text-xs text-muted-foreground">{item.svmDescription}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-semibold", getScoreColor(item.score).replace('bg-', 'text-'))}>{item.score}%</span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground max-w-[200px]">{item.gapAnalysis}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm max-w-[200px]">{item.recommendation}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={alignmentPage}
          totalPages={alignmentTotalPages}
          totalItems={filteredAlignmentData.length}
          onPageChange={setAlignmentPage}
        />
      </Card>
      
      {/* Buyer Value Map (BVM) */}
      <Card className="overflow-hidden">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Buyer Value Map (BVM)</h3>
              <p className="text-sm text-muted-foreground">Comprehensive value drivers (primitives) and areas of focus for buying team</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={bvmFilter} onValueChange={setBvmFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {bvmCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9" title="Refresh Data">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
              Complete Framework
            </Badge>
            <span className="text-xs text-muted-foreground">All BVM data displayed on platform</span>
          </div>
        </div>
        
        {/* BVM Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Field</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Why?</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBvmData.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", getCategoryDotColor(item.categoryColor))} />
                      <span className="text-sm">{item.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-orange/10 text-orange border-orange/20 hover:bg-orange/20">
                      {item.field}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-muted-foreground">-</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={bvmPage}
          totalPages={bvmTotalPages}
          totalItems={filteredBvmData.length}
          onPageChange={setBvmPage}
        />
      </Card>
      
      {/* Seller Value Map (SVM) */}
      <Card className="overflow-hidden">
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Seller Value Map (SVM)</h3>
              <p className="text-sm text-muted-foreground">Core offering data fields and capability mapping</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Deal SVM</span>
                <Switch 
                  checked={svmViewMode === "full"}
                  onCheckedChange={(checked) => setSvmViewMode(checked ? "full" : "deal")}
                />
                <span className="text-sm font-medium">Full SVM</span>
              </div>
              <Select value={svmFilter} onValueChange={setSvmFilter}>
                <SelectTrigger className="w-[120px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Fields" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9" title="Refresh Data">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="bg-purple/10 text-purple border-purple/20">
              Deal-Specific View
            </Badge>
            <span className="text-xs text-muted-foreground">Mapped info specific to current deal</span>
          </div>
        </div>
        
        {/* SVM Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Field</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Description</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Why Needed / Match to BVM</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Mapped BVM Field(s)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSvmData.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{item.field}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-muted-foreground">{item.whyNeeded}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.mappedBvm.length > 0 ? (
                        item.mappedBvm.map((bvm, idx) => (
                          <Badge key={idx} className="bg-purple/10 text-purple border-purple/20 text-xs">
                            {bvm}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Pagination
          currentPage={svmPage}
          totalPages={svmTotalPages}
          totalItems={svmData.length}
          onPageChange={setSvmPage}
        />
      </Card>
    </div>
  );
}
