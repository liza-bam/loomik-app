import { 
  TrendingUp, DollarSign, Activity, Layers, Heart, Shield, 
  FileCheck, Zap, Link, BarChart3, Lightbulb, Award, 
  Leaf, Users, Handshake, LucideIcon 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  type ValuePrimitiveId, 
  getPrimitiveById,
} from "@/lib/value-primitives/types";
import { getPrimitiveDisplayConfig } from "@/lib/value-primitives/primitiveConfig";
import { cn } from "@/lib/utils";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  DollarSign,
  Activity,
  Layers,
  Heart,
  Shield,
  FileCheck,
  Zap,
  Link,
  BarChart3,
  Lightbulb,
  Award,
  Leaf,
  Users,
  Handshake
};

interface ValuePrimitiveBadgeProps {
  primitiveId: ValuePrimitiveId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTooltip?: boolean;
  isPrimary?: boolean;
  weight?: number; // 0-100
  className?: string;
}

export const ValuePrimitiveBadge = ({
  primitiveId,
  size = 'sm',
  showLabel = false,
  showTooltip = true,
  isPrimary = false,
  weight,
  className
}: ValuePrimitiveBadgeProps) => {
  const primitive = getPrimitiveById(primitiveId);
  const config = getPrimitiveDisplayConfig(primitiveId);
  
  if (!primitive) return null;
  
  const Icon = ICON_MAP[config.iconName] || Activity;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const badge = (
    <div 
      className={cn(
        "flex items-center gap-1.5 transition-all duration-200",
        showLabel && "px-2 py-1 rounded-md",
        showLabel && config.bgClass,
        showLabel && "border",
        showLabel && config.borderClass,
        className
      )}
    >
      <div 
        className={cn(
          "rounded-md flex items-center justify-center transition-all",
          sizeClasses[size],
          config.bgClass,
          isPrimary && "ring-1 ring-ring ring-offset-1"
        )}
      >
        <Icon className={cn(iconSizes[size], config.colorClass)} />
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", config.colorClass)}>
          {primitive.shortLabel}
          {weight !== undefined && (
            <span className="text-muted-foreground ml-1">({weight}%)</span>
          )}
        </span>
      )}
    </div>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium text-sm">{primitive.label}</p>
          <p className="text-xs text-muted-foreground">{primitive.description}</p>
          {weight !== undefined && (
            <p className="text-xs">
              <span className={isPrimary ? "text-foreground font-medium" : "text-muted-foreground"}>
                {isPrimary ? "Primary" : "Secondary"} Priority: {weight}%
              </span>
            </p>
          )}
          {primitive.kpis.length > 0 && (
            <p className="text-xs text-muted-foreground">
              KPIs: {primitive.kpis.join(", ")}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default ValuePrimitiveBadge;
