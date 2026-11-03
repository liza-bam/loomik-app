import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Stakeholder } from "@/data/dealData";
import { scoreFill, sentimentBadge, avatarFallback, selectedChip, categoryBadge } from "@/lib/tone";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  className?: string;
}

export const StakeholderCard = ({ stakeholder, className = "" }: StakeholderCardProps) => {
  const { openPopup } = useStakeholderPopup();

  return (
    <div
      onClick={() => openPopup(stakeholder)}
      className={`group relative bg-card border border-border rounded-lg p-3 cursor-pointer transition-shadow hover:shadow-md ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-8 h-8">
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
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sentimentBadge(stakeholder.status)}`}>
          {stakeholder.status}
        </span>
      </div>

      {/* Two-Column Layout: Metrics | Value Primitives */}
      <div className="flex gap-3">
        {/* Left Column: Metrics */}
        <div className="flex-1 space-y-1.5">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">Priority</span>
              <span className="text-xs font-medium">{stakeholder.priority}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreFill(stakeholder.priority)} transition-all duration-500`}
                style={{ width: `${stakeholder.priority}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">Sentiment</span>
              <span className="text-xs font-medium">{stakeholder.sentiment}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreFill(stakeholder.sentiment)} transition-all duration-500`}
                style={{ width: `${stakeholder.sentiment}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">Engagement</span>
              <span className="text-xs font-medium">{stakeholder.engagement}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreFill(stakeholder.engagement)} transition-all duration-500`}
                style={{ width: `${stakeholder.engagement}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Focus Area Pills */}
        <div className="flex-shrink-0 flex flex-col justify-center gap-1">
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
      </div>
    </div>
  );
};

export default StakeholderCard;
