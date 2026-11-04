import { useState } from "react";
import { RefreshCw, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { executePullSignals } from "@/lib/simulation/pullSignals";
import { useToast } from "@/hooks/use-toast";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import Logo from "@/components/Logo";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  // Local state so the AI drawer always starts closed on mobile (the persisted desktop panel state is separate)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
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
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={isPulling}
        >
          <RefreshCw className={`w-5 h-5 ${isPulling ? 'animate-spin text-primary' : ''}`} />
          <span className="text-xs">Pull</span>
        </button>
        
        <button 
          onClick={() => navigate("/history")} 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isHistoryPage ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-xs">History</span>
        </button>
        
        <button 
          onClick={() => setIsAIPanelOpen(true)} 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isAIPanelOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Logo className="h-5" />
          <span className="text-xs">Ask Loomik</span>
        </button>
      </nav>

      {/* Loomik AI - bottom drawer, drag down to close */}
      <Drawer open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen} shouldScaleBackground={false}>
        <DrawerContent className="h-drawer bg-card">
          <DrawerTitle className="sr-only">Ask Loomik</DrawerTitle>
          <div className="flex-1 min-h-0">
            <AIChatPanel />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default MobileBottomNav;