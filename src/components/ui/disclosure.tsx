import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface DisclosureProps {
  title: React.ReactNode;
  /** Short hint shown next to the title while closed, e.g. a count ("2 files"). */
  summary?: React.ReactNode;
  icon?: React.ElementType;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Progressive disclosure: secondary content stays folded until the user asks for it.
 * Use for anything that isn't needed to take the main action (context, attachments, history...).
 */
const Disclosure = ({ title, summary, icon: Icon, defaultOpen = false, className, children }: DisclosureProps) => (
  <Collapsible defaultOpen={defaultOpen} className={cn("group border-b border-border last:border-b-0", className)}>
    <CollapsibleTrigger className="flex w-full items-center gap-2 py-3 text-left text-sm font-medium text-foreground hover:text-primary transition-colors">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      <span className="flex-1">{title}</span>
      {summary && <span className="text-xs text-muted-foreground group-data-[state=open]:hidden">{summary}</span>}
      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent className="pb-4 data-[state=open]:animate-fade-in">{children}</CollapsibleContent>
  </Collapsible>
);

export { Disclosure };
