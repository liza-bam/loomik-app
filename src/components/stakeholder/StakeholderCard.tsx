import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Stakeholder } from "@/data/dealData";
import { scoreFill, sentimentBadge, avatarFallback } from "@/lib/tone";
import { useStakeholderPopup } from "@/contexts/StakeholderPopupContext";

const METRICS = [
  { key: "priority", label: "Priority" },
  { key: "sentiment", label: "Sentiment" },
  { key: "engagement", label: "Engagement" },
] as const;

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  className?: string;
}

/** Compact card: who + three scores. Value primitives, trends and actions live in the popup. */
export const StakeholderCard = ({ stakeholder, className = "" }: StakeholderCardProps) => {
  const { openPopup } = useStakeholderPopup();

  return (
    <button
      onClick={() => openPopup(stakeholder)}
      className={`group w-full text-left bg-card border border-border rounded-lg p-3 transition-shadow hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src={stakeholder.avatar} />
          <AvatarFallback className={`${avatarFallback} text-xs font-medium`}>
            {stakeholder.name.split(" ").map((n) => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate transition-colors group-hover:text-primary">
            {stakeholder.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{stakeholder.role}</p>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${sentimentBadge(stakeholder.status)}`}>
          {stakeholder.status}
        </span>
      </div>

      <div className="space-y-1.5">
        {METRICS.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-medium text-foreground">{stakeholder[key]}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreFill(stakeholder[key])} transition-all duration-500`}
                style={{ width: `${stakeholder[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </button>
  );
};

export default StakeholderCard;
