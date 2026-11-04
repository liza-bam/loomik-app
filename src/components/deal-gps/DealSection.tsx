import { useState, type ElementType, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Disclosure } from "@/components/ui/disclosure";
import { scoreColor, scoreFill, scoreText } from "@/lib/tone";

interface DealSectionProps {
  title: string;
  icon: ElementType;
  /** Desktop subtitle under the title. */
  description?: string;
  /** Phone hint shown while folded, e.g. "3 risks". */
  summary?: ReactNode;
  /** Desktop-only content between the title and the chevron. */
  headerExtra?: ReactNode;
  compact: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A Deal GPS section: a card header on desktop, a folded <Disclosure> on phones. */
export const DealSection = ({ title, icon: Icon, description, summary, headerExtra, compact, defaultOpen = false, children }: DealSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);

  if (compact) {
    return (
      <Disclosure title={title} icon={Icon} summary={summary} defaultOpen={defaultOpen}>
        {children}
      </Disclosure>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-subtle">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {headerExtra}
            <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

/** Compact score gauge: a ring filled to the score, number in the middle. */
export const ScoreRing = ({ value, className = "w-20 h-20 text-xl" }: { value: number; className?: string }) => (
  <div className={`shrink-0 rounded-full p-1.5 ${className}`} style={{ background: `conic-gradient(${scoreColor(value)} ${value}%, hsl(var(--muted)) 0)` }}>
    <div className={`w-full h-full rounded-full bg-card flex items-center justify-center font-bold ${scoreText(value)}`}>{value}%</div>
  </div>
);

/** A score and the drivers behind it (label, value, bar). */
export const ScoreDrivers = ({ score, drivers }: { score: number; drivers: { label: string; value: number }[] }) => (
  <div className="flex items-center gap-5">
    <ScoreRing value={score} />
    <div className="flex-1 space-y-2.5">
      {drivers.map((d) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{d.label}</span>
            <span className={`font-semibold ${scoreText(d.value)}`}>{d.value}%</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${scoreFill(d.value)}`} style={{ width: `${Math.min(d.value, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
