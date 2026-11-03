import { useState } from 'react';
import { Bell, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSignalsStore } from '@/stores/signalsStore';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function SimulationControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { signals, getRiskCount, getSignalCount } = useSignalsStore();
  const isMobile = useIsMobile();
  
  // Hide on mobile - functionality is in bottom nav
  if (isMobile) return null;
  
  const riskCount = getRiskCount();
  const signalCount = getSignalCount();
  const recentSignals = signals.slice(0, 3);

  return (
    <div className="fixed bottom-20 left-4 z-50">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mb-2 bg-card border border-border rounded-lg shadow-lg p-3 w-64 animate-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              Recent Signals
            </h3>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-muted rounded p-2">
              <p className="text-muted-foreground">Signals</p>
              <p className="font-semibold text-lg text-foreground">{signalCount}</p>
            </div>
            <div className="bg-danger-subtle rounded p-2">
              <p className="text-muted-foreground">Risks</p>
              <p className="font-semibold text-lg text-danger">{riskCount}</p>
            </div>
          </div>
          
          {/* Recent Signals Feed */}
          {recentSignals.length > 0 ? (
            <div className="border-t border-border pt-2">
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {recentSignals.map((signal) => (
                  <div 
                    key={signal.id} 
                    className="flex items-start gap-2 text-xs"
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      signal.type === 'risk' ? "bg-danger" : "bg-primary"
                    )} />
                    <p className="text-muted-foreground line-clamp-2">
                      {signal.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">No recent signals</p>
          )}
        </div>
      )}
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all",
          (signalCount > 0 || riskCount > 0)
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-border text-foreground hover:bg-muted"
        )}
      >
        <Bell className="w-4 h-4" />
        <span className="text-xs font-medium">
          {signalCount + riskCount} signals
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
