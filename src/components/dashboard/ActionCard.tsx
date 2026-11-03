import { Mail, Video, Calendar, Archive, Eye, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { avatarFallback, categoryBadge, priorityDot, selectedChip } from "@/lib/tone";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

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

const ActionCard = ({ action, isGenerated, onGoToAction, onArchive }: ActionCardProps) => {
  const ActionIcon = action.type === "email" ? Mail : Video;

  return (
    <Card 
      className="p-4 interactive-card flex flex-col"
      onClick={() => onGoToAction(action)}
    >
      {/* Header: Type icon, Title, Company + Stakeholders */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0 relative">
          <ActionIcon className="w-5 h-5 text-primary" />
          {isGenerated && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-primary-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${priorityDot(action.priority)}`} />
            <p className="font-medium text-foreground text-sm line-clamp-1">{action.title}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground truncate">{action.companyName}</p>
            {action.isCrossSell && (
              <span className={`text-xxs font-medium rounded px-1.5 py-0 whitespace-nowrap ${categoryBadge}`}>
                Cross-sell
              </span>
            )}
          </div>
        </div>
        {/* Stakeholder avatars inline */}
        <div className="flex items-center -space-x-1.5 shrink-0">
          {action.stakeholders.slice(0, 2).map((s) => (
            <Avatar key={s.id} className="w-6 h-6 border-2 border-card">
              <AvatarImage src={s.avatar} />
              <AvatarFallback className={`text-xxs ${avatarFallback}`}>
                {s.name?.split(" ").map(n => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
          ))}
          {action.stakeholders.length > 2 && (
            <span className="text-xxs text-muted-foreground ml-1.5">+{action.stakeholders.length - 2}</span>
          )}
        </div>
      </div>

      {/* Artifact & Based On */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{action.basedOn}</p>
      </div>

      {/* Value Primitives row */}
      {action.stakeholders.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {getPrimitivesForRole(action.stakeholders[0].role).slice(0, 3).map((p) => {
            const primitive = getPrimitiveById(p.primitiveId);
            if (!primitive) return null;
            const pillStyles = p.weight > 70 ? selectedChip : categoryBadge;
            return (
              <span key={p.primitiveId} className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${pillStyles}`}>
                {primitive.shortLabel}
              </span>
            );
          })}
        </div>
      )}
      
      {/* Deadline row */}
      <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
        <Calendar className="w-3 h-3" />
        <span className="text-xxs">{action.deadline}</span>
      </div>

      {/* Actions - icon-only buttons */}
      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.stopPropagation(); onArchive(action); }}
          title="Archive"
        >
          <Archive className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onGoToAction(action)}
          title="Go to Action"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ActionCard;
