// New signals notification indicator
import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSignalsStore } from "@/stores/signalsStore";
import { toast } from "@/hooks/use-toast";

interface NewSignalNotificationProps {
  onClick?: () => void;
}

export const NewSignalNotification = ({ onClick }: NewSignalNotificationProps) => {
  const { signals, getRiskCount, getSignalCount } = useSignalsStore();
  const [hasNewItems, setHasNewItems] = useState(false);
  const [newRisks, setNewRisks] = useState(0);
  const [newSignals, setNewSignals] = useState(0);
  const prevCountRef = useRef({ risks: 0, signals: 0 });
  const lastNotificationRef = useRef<Date | null>(null);
  
  useEffect(() => {
    const currentRisks = getRiskCount();
    const currentSignals = getSignalCount();
    
    // Check if there are new items since last check
    const newRiskCount = Math.max(0, currentRisks - prevCountRef.current.risks);
    const newSignalCount = Math.max(0, currentSignals - prevCountRef.current.signals);
    
    if (newRiskCount > 0 || newSignalCount > 0) {
      setHasNewItems(true);
      setNewRisks(prev => prev + newRiskCount);
      setNewSignals(prev => prev + newSignalCount);
      
      // Show subtle toast notification (max once per 30 seconds)
      const now = new Date();
      if (!lastNotificationRef.current || (now.getTime() - lastNotificationRef.current.getTime()) > 30000) {
        lastNotificationRef.current = now;
        
        const message = [];
        if (newRiskCount > 0) message.push(`${newRiskCount} new risk${newRiskCount > 1 ? 's' : ''}`);
        if (newSignalCount > 0) message.push(`${newSignalCount} new signal${newSignalCount > 1 ? 's' : ''}`);
        
        toast({
          title: "New Intelligence Detected",
          description: message.join(' and '),
          duration: 4000,
        });
      }
    }
    
    prevCountRef.current = { risks: currentRisks, signals: currentSignals };
  }, [signals, getRiskCount, getSignalCount]);
  
  const handleClick = () => {
    setHasNewItems(false);
    setNewRisks(0);
    setNewSignals(0);
    onClick?.();
  };
  
  const totalNew = newRisks + newSignals;
  
  if (!hasNewItems || totalNew === 0) return null;
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "bg-primary-subtle text-primary hover:bg-accent transition-colors"
      )}
    >
      <Bell className="w-3.5 h-3.5" />
      <span>{totalNew} new</span>
      {newRisks > 0 && (
        <span className="w-1.5 h-1.5 rounded-full bg-danger" />
      )}
    </button>
  );
};
