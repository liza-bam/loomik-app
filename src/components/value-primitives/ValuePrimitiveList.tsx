import { ValuePrimitiveBadge } from "./ValuePrimitiveBadge";
import { 
  type ValuePrimitiveId, 
  type StakeholderPrimitiveWeight,
  getPrimitiveById 
} from "@/lib/value-primitives/types";
import { getPrimitivesForRole, getTopPrimitivesForRole } from "@/lib/value-primitives/roleDefaults";
import { cn } from "@/lib/utils";

interface ValuePrimitiveListProps {
  // Either provide explicit primitives or derive from role
  primitives?: StakeholderPrimitiveWeight[];
  role?: string;
  maxDisplay?: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export const ValuePrimitiveList = ({
  primitives,
  role,
  maxDisplay = 3,
  showLabels = false,
  size = 'sm',
  layout = 'horizontal',
  className
}: ValuePrimitiveListProps) => {
  // Get primitives from role if not explicitly provided
  const displayPrimitives = primitives || (role ? getPrimitivesForRole(role) : []);
  const visiblePrimitives = displayPrimitives.slice(0, maxDisplay);
  const hiddenCount = displayPrimitives.length - maxDisplay;
  
  const layoutClasses = {
    horizontal: 'flex items-center gap-1.5 flex-wrap',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2'
  };
  
  return (
    <div className={cn(layoutClasses[layout], className)}>
      {visiblePrimitives.map((p) => (
        <ValuePrimitiveBadge
          key={p.primitiveId}
          primitiveId={p.primitiveId}
          size={size}
          showLabel={showLabels}
          isPrimary={p.isPrimary}
          weight={p.weight}
        />
      ))}
      {hiddenCount > 0 && (
        <span className="text-xs text-muted-foreground">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

export default ValuePrimitiveList;
