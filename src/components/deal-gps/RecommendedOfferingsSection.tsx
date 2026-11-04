// RecommendedOfferingsSection - Matched offerings based on unmet buyer needs
import { Star, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DealSection } from "./DealSection";
import { scoreText, categoryBadge } from "@/lib/tone";

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
  compact: boolean;
  onCreateAction: (offering: RecommendedOffering) => void;
}

export const RecommendedOfferingsSection = ({
  compact,
  onCreateAction,
}: RecommendedOfferingsSectionProps) => {

  return (
    <DealSection
      title="Recommended offerings"
      icon={Star}
      description="Matched to unmet buyer needs"
      summary={`${recommendedOfferings.length} matches`}
      headerExtra={
        <div className="hidden md:flex items-center gap-1.5 mr-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Buyer priorities:</span>
          {BUYER_PRIORITIES.map((p) => (
            <Badge key={p} variant="outline" className={`text-xxs px-2 py-0 h-5 whitespace-nowrap border-transparent ${categoryBadge}`}>
              {p}
            </Badge>
          ))}
        </div>
      }
      compact={compact}
    >
        <div className="space-y-6">
          {/* Section 1: Already Covered */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Already Covered</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coveredOfferings.map((offering) => (
                <Card key={offering.name} className="p-4 space-y-2.5">
                  <p className="text-sm font-semibold text-foreground">{offering.name}</p>
                  <p className="text-xs text-muted-foreground italic line-clamp-2">"{offering.buyerSignalQuote}"</p>
                  <Progress value={offering.alignmentPct} className="h-2 bg-muted" />
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xxs h-5 border-transparent bg-success-subtle text-success">
                      Mentioned
                    </Badge>
                    <span className={`text-xs font-medium ${scoreText(offering.alignmentPct)}`}>{offering.alignmentPct}%</span>
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
                    <Badge variant="secondary" className="text-xs font-medium">
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
                      className="gap-1.5"
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
        </div>
    </DealSection>
  );
};

export default RecommendedOfferingsSection;
