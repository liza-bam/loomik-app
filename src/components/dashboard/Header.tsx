import { useState } from "react";
import { Bell, AlertTriangle, History, RefreshCw, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import loomikLogo from "@/assets/loomik-logo.svg";
import loomikLogoSmall from "@/assets/loomik-logo-small.svg";
import userAvatar from "@/assets/user-avatar.jpg";
import RisksSignalsDialog from "./RisksSignalsDialog";
import { useSignalsStore } from "@/stores/signalsStore";
import { executePullSignals } from "@/lib/simulation/pullSignals";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { trendText } from "@/lib/tone";

interface HeaderProps {
  isScrolled?: boolean;
}

const Header = ({ isScrolled = false }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [risksSignalsOpen, setRisksSignalsOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"risks" | "signals">("risks");
  const [isPulling, setIsPulling] = useState(false);
  const { getRiskCount, getSignalCount } = useSignalsStore();
  const isMobile = useIsMobile();
  
  const riskCount = getRiskCount();
  const signalCount = getSignalCount();

  const handleOpenRisks = () => {
    setDefaultTab("risks");
    setRisksSignalsOpen(true);
  };

  const handleOpenSignals = () => {
    setDefaultTab("signals");
    setRisksSignalsOpen(true);
  };

  const handlePull = () => {
    setIsPulling(true);
    const result = executePullSignals();
    toast({
      title: "📡 Data Pulled",
      description: `Analyzed ${result.activities} activities, detected ${result.signals} signal${result.signals !== 1 ? 's' : ''}.`,
    });
    setTimeout(() => setIsPulling(false), 1000);
  };

  return (
    <>
      <header className="bg-card border-b border-border px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <img src={loomikLogo} alt="Loomik" className="h-6 hidden lg:block" />
          <img src={loomikLogoSmall} alt="Loomik" className="h-5 lg:hidden" />
          
          {/* Mobile: Show deal count and value */}
          {isMobile && (
            <span className="text-foreground font-medium">4 Deals • $3.2M</span>
          )}
          
          {/* Desktop metrics */}
          {!isMobile && (
            <>
              <span className="text-muted-foreground hidden lg:inline">Deals</span><span className="hidden lg:inline">7</span>
              <span className="text-border hidden lg:inline">|</span>
              <span className="text-muted-foreground hidden lg:inline">Value</span><span className="hidden lg:inline">$8.0M</span>
              <span className="text-border hidden lg:inline">|</span>
              <span className="text-muted-foreground">Alignment</span>
              <span className="font-semibold text-foreground">72%</span><span className={`font-semibold ${trendText(5)}`}>↑5%</span>
              <span className="text-xs text-muted-foreground bg-muted px-1 rounded hidden 2xl:inline">vs last week</span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground">Win</span>
              <span className="font-semibold text-foreground">63%</span><span className={`font-semibold ${trendText(-3)}`}>↓3%</span>
              <span className="text-xs text-muted-foreground bg-muted px-1 rounded hidden 2xl:inline">vs last week</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Signals badge */}
          <button onClick={handleOpenSignals} className="flex items-center gap-1 px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
            <Bell className="w-3.5 h-3.5" />
            <span className="bg-primary text-primary-foreground text-xxs px-1.5 h-5 rounded-full inline-flex items-center justify-center min-w-[20px] font-semibold">{signalCount || 0}</span>
          </button>
          
          {/* Risks badge */}
          <button onClick={handleOpenRisks} className="flex items-center gap-1 px-1.5 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="bg-danger text-danger-foreground text-xxs px-1.5 h-5 rounded-full inline-flex items-center justify-center min-w-[20px] font-semibold">{riskCount || 0}</span>
          </button>
          
          {/* Pull button - hidden on mobile (in bottom nav) */}
          {!isMobile && (
            <button 
              onClick={handlePull} 
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" 
              title="Pull Signals & Risks"
              disabled={isPulling}
            >
              <RefreshCw className={`w-4 h-4 ${isPulling ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          {/* History button - hidden on mobile */}
          {!isMobile && (
            <button onClick={() => navigate("/history")} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors" title="History">
              <History className="w-4 h-4" />
            </button>
          )}
          
          {/* Avatar - hidden on mobile */}
          {!isMobile && (
            <Avatar className="w-7 h-7 cursor-pointer hover:scale-105 transition-transform">
              <AvatarImage src={userAvatar} alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xxs">RA</AvatarFallback>
            </Avatar>
          )}
        </div>
      </header>

      <RisksSignalsDialog 
        open={risksSignalsOpen} 
        onOpenChange={setRisksSignalsOpen}
        defaultTab={defaultTab}
      />
    </>
  );
};

export default Header;
