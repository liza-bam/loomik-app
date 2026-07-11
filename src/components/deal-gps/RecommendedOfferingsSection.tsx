// RecommendedOfferingsSection - Matched offerings based on unmet buyer needs
import { useState } from "react";
import { Star, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// ==================== TYPES ====================

interface SignalEvidence {
  source: string; // e.g. "Call transcript", "Email", "External"
  stakeholder: string;
  quote: string;
}

interface CoveredOffering {
  name: string;
  buyerSignalQuote: string;
  alignmentPct: number;
}

export interface RecommendedOffering {
  id: string;
  name: string;
  alignmentPct: number;
  signals: SignalEvidence[];
  note?: string; // e.g. "Moderate confidence — no budget or timeline confirmed"
}

// ==================== STATIC DEMO DATA ====================

const coveredOfferings: CoveredOffering[] = [
  {
    name: "Threat Intelligence Platform",
    buyerSignalQuote: "We need real-time threat feeds integrated into our SOC workflow",
    alignmentPct: 90,
  },
  {
    name: "Identity & Access Management",
    buyerSignalQuote: "SSO and MFA are non-negotiable for our compliance posture",
    alignmentPct: 88,
  },
  {
    name: "Endpoint Detection & Response",
    buyerSignalQuote: "Our current EDR is creating too many false positives",
    alignmentPct: 82,
  },
  {
    name: "Security Awareness Training",
    buyerSignalQuote: "Phishing simulation results are unacceptable — need better training",
    alignmentPct: 76,
  },
];

const recommendedOfferings: RecommendedOffering[] = [
  {
    id: "ro-1",
    name: "Managed Security",
    alignmentPct: 92,
    signals: [
      { source: "Call transcript", stakeholder: "Priya Sharma", quote: "We have serious concerns about data residency — need to ensure all processing stays within US boundaries" },
      { source: "Email", stakeholder: "Priya Sharma", quote: "Our legal team flagged NYDFS 500 deadline in Q3 — we need a compliance-ready security layer before then" },
      { source: "External", stakeholder: "Industry Report", quote: "Gartner predicts 60% of enterprises will consolidate to managed security by 2026" },
    ],
  },
  {
    id: "ro-2",
    name: "Compliance Audit",
    alignmentPct: 85,
    signals: [
      { source: "Call transcript", stakeholder: "Lisa Wang", quote: "Our audit prep cycle takes 3 months — we need to cut that in half" },
      { source: "Email", stakeholder: "Lisa Wang", quote: "Board is asking for continuous compliance monitoring, not just annual audits" },
    ],
  },
  {
    id: "ro-3",
    name: "Cloud Migration",
    alignmentPct: 71,
    signals: [
      { source: "Call transcript", stakeholder: "Michael Torres", quote: "Our on-prem infrastructure is approaching end-of-life but we haven't scoped the migration yet" },
      { source: "External", stakeholder: "Market Analysis", quote: "Competitor announced hybrid cloud offering — potential urgency driver" },
    ],
    note: "Moderate confidence — no budget or timeline confirmed",
  },
];

const BUYER_PRIORITIES = ["Risk Mitigation", "Cost Efficiency", "Time-to-Outcome"];

// ==================== COMPONENT ====================

interface RecommendedOfferingsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  onCreateAction: (offering: RecommendedOffering) => void;
}

export const RecommendedOfferingsSection = ({
  isOpen,
  onToggle,
  onCreateAction,
}: RecommendedOfferingsSectionProps) => {

  const getAlignmentBadgeStyle = (pct: number) => {
    if (pct >= 80) return "bg-green/10 text-green border-green/30";
    if (pct >= 70) return "bg-yellow/10 text-yellow border-yellow/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <section className="space-y-4">
        {/* Section Header */}
        <CollapsibleTrigger asChild>
          <Card className="p-4 bg-gradient-to-r from-purple/5 to-transparent border-l-4 border-l-purple cursor-pointer hover:bg-purple/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple/10">
                <Star className="w-5 h-5 text-purple fill-purple" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">RECOMMENDED OFFERINGS</h2>
                </div>
                <p className="text-sm text-muted-foreground">Matched to unmet buyer needs</p>
              </div>
              {/* Inline preview tags when collapsed */}
              {!isOpen && (
                <div className="hidden md:flex items-center gap-1.5 mr-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Buyer priorities:</span>
                  {BUYER_PRIORITIES.map((p) => (
                    <Badge key={p} variant="outline" className="text-xxs px-2 py-0 h-5 whitespace-nowrap border-purple/30 text-purple bg-purple/5">
                      {p}
                    </Badge>
                  ))}
                </div>
              )}
              {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
            </div>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6">
          {/* Section 1: Already Covered */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Already Covered</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coveredOfferings.map((offering) => (
                <Card key={offering.name} className="p-4 space-y-2.5">
                  <p className="text-sm font-semibold text-foreground">{offering.name}</p>
                  <p className="text-xs text-muted-foreground italic line-clamp-2">"{offering.buyerSignalQuote}"</p>
                  <Progress value={offering.alignmentPct} className="h-2 bg-muted [&>div]:bg-green" />
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xxs h-5 border-green/30 text-green bg-green/5">
                      Mentioned
                    </Badge>
                    <span className="text-xs font-medium text-green">{offering.alignmentPct}%</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Section 2: Recommended Based on Recent Signals */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Recommended Based on Recent Signals</p>
            <div className="space-y-3">
              {recommendedOfferings.map((offering) => (
                <Card key={offering.id} className="p-4 space-y-3">
                  {/* Row 1: Name + Badge */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{offering.name}</p>
                    <Badge variant="outline" className={cn("text-xs font-medium", getAlignmentBadgeStyle(offering.alignmentPct))}>
                      {offering.alignmentPct}%
                    </Badge>
                  </div>

                  {/* Signal evidence */}
                  <div className="space-y-1.5">
                    {offering.signals.map((signal, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-medium text-foreground/70">[{signal.source}]</span>{" "}
                        <span className="font-medium">{signal.stakeholder}:</span>{" "}
                        "{signal.quote}"
                      </p>
                    ))}
                  </div>

                  {/* Note if present */}
                  {offering.note && (
                    <p className="text-xs text-muted-foreground italic bg-muted/30 rounded px-2 py-1">
                      {offering.note}
                    </p>
                  )}

                  {/* Create action button */}
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple text-purple hover:bg-purple/10 gap-1.5"
                      onClick={() => onCreateAction(offering)}
                    >
                      Create action
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
};

export default RecommendedOfferingsSection;
