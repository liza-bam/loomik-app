import { useState } from "react";
import { RefreshCw, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { executePullSignals } from "@/lib/simulation/pullSignals";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import loomikIcon from "@/assets/loomik-icon.svg";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAIPanelOpen, setIsAIPanelOpen } = useUIStore();
  const [isPulling, setIsPulling] = useState(false);

  const isHistoryPage = location.pathname === "/history";

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
      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 flex justify-around items-center z-50">
        <button 
          onClick={handlePull} 
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-purple transition-colors"
          disabled={isPulling}
        >
          <RefreshCw className={`w-5 h-5 ${isPulling ? 'animate-spin text-purple' : ''}`} />
          <span className="text-xs">Pull</span>
        </button>
        
        <button 
          onClick={() => navigate("/history")} 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isHistoryPage ? 'text-purple' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-xs">History</span>
        </button>
        
        <button 
          onClick={() => setIsAIPanelOpen(true)} 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isAIPanelOpen ? 'text-purple' : 'text-muted-foreground hover:text-purple'}`}
        >
          <img src={loomikIcon} alt="Loomik" className="w-5 h-5" />
          <span className="text-xs">Ask Loomik</span>
        </button>
      </nav>

      {/* AI Sheet Overlay - slides from RIGHT */}
      <Sheet open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
          <AIChatPanel />
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileBottomNav;