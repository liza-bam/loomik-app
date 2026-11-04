import { Mail, Video, Archive, Sparkles, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { avatarFallback, priorityDot } from "@/lib/tone";

interface Stakeholder {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

export interface DisplayAction {
  id: number;
  title: string;
  stakeholders: Stakeholder[];
  stakeholderIds?: number[];
  artifact: string;
  basedOn: string;
  priority: "high" | "medium" | "low";
  type: "email" | "meeting";
  deadline: string;
  dealName: string;
  dealValue: string;
  companyName: string;
  companyLogo: string;
  winProbability: number;
  isGenerated?: boolean;
  isCrossSell?: boolean;
}

interface ActionCardProps {
  action: DisplayAction;
  isGenerated?: boolean;
  onGoToAction: (action: DisplayAction) => void;
  onArchive: (action: DisplayAction) => void;
}

/** Compact action card: what, for whom, when, and one "Open" action. */
const ActionCard = ({ action, isGenerated, onGoToAction, onArchive }: ActionCardProps) => {
  const ActionIcon = action.type === "email" ? Mail : Video;

  return (
    <Card className="p-4 interactive-card space-y-3" onClick={() => onGoToAction(action)}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0 relative">
          <ActionIcon className="w-5 h-5 text-primary" />
          {isGenerated && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm line-clamp-2">{action.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(action.priority)}`} />
            <span className="truncate">
              {action.companyName}
              {action.isCrossSell && " · Cross-sell"} · {action.deadline}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5 flex-1">
          {action.stakeholders.slice(0, 3).map((s) => (
            <Avatar key={s.id} className="w-6 h-6 border-2 border-card">
              <AvatarImage src={s.avatar} />
              <AvatarFallback className={`text-xxs ${avatarFallback}`}>
                {s.name?.split(" ").map((n) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground"
          aria-label="Archive"
          title="Archive"
          onClick={(e) => { e.stopPropagation(); onArchive(action); }}
        >
          <Archive />
        </Button>
        <Button
          variant="outline"
          data-action-go
          onClick={(e) => { e.stopPropagation(); onGoToAction(action); }}
        >
          Open
          <ChevronRight />
        </Button>
      </div>
    </Card>
  );
};

export default ActionCard;
