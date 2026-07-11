import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarColors, getProgressColor, type Stakeholder } from "@/data/dealData";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";
import { getPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { getPrimitiveById } from "@/lib/value-primitives/types";

const getAvatarColor = (id: number) => avatarColors[id % avatarColors.length];

const getLocalStatusColor = (status: "positive" | "neutral" | "negative") => {
  switch (status) {
    case "positive":
      return "bg-green/10 text-green border-green/20";
    case "neutral":
      return "bg-yellow/10 text-yellow border-yellow/20";
    case "negative":
      return "bg-red/10 text-red border-red/20";
  }
};

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  className?: string;
}

export const StakeholderCard = ({ stakeholder, className = "" }: StakeholderCardProps) => {
  const { openPopup } = useStakeholderPopup();

  return (
    <div
      onClick={() => openPopup(stakeholder)}
      className={`group relative bg-card border border-border rounded-lg p-3 cursor-pointer
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-purple/10 hover:border-purple/40 hover:-translate-y-0.5
        before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
        ${className}`}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-purple/20 via-primary/10 to-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Avatar 
          className="w-8 h-8 transition-all duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-purple/30 group-hover:ring-offset-1 group-hover:ring-offset-card"
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
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium border transition-all duration-200 group-hover:scale-105 ${getLocalStatusColor(stakeholder.status)}`}>
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
                className={`h-full rounded-full ${getProgressColor(stakeholder.priority)} transition-all duration-500`}
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
                className={`h-full rounded-full ${getProgressColor(stakeholder.sentiment)} transition-all duration-500`}
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
                className={`h-full rounded-full ${getProgressColor(stakeholder.engagement)} transition-all duration-500`}
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
      </div>
    </div>
  );
};

export default StakeholderCard;
