import { useState } from "react";
import { Activity, Zap, Eye, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import Logo from "@/components/Logo";

const tabs = [
  { label: "Home", icon: Activity, path: "/" },
  { label: "Actions", icon: Zap, path: "/action-hub" },
  null, // Ask Loomik sits in the middle
  { label: "Deal GPS", icon: Eye, path: "/deal-gps" },
  { label: "Calendar", icon: Calendar, path: "/calendar" },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  // Local state so the AI drawer always starts closed (the persisted desktop panel state is separate)
  const [isAIOpen, setIsAIOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border px-2 pb-1 grid grid-cols-5 items-end">
        {tabs.map((tab) =>
          tab ? (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 py-2 text-xxs font-medium transition-colors ${
                pathname === tab.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </Link>
          ) : (
            <button
              key="ai"
              onClick={() => setIsAIOpen(true)}
              className="flex flex-col items-center gap-0.5 pb-2 text-xxs font-medium text-foreground"
              aria-label="Ask Loomik"
            >
              <span className="-mt-6 w-14 h-14 rounded-full bg-primary-subtle ring-4 ring-card shadow-md flex items-center justify-center">
                <Logo className="h-6" />
              </span>
              Ask Loomik
            </button>
          ),
        )}
      </nav>

      {/* Loomik AI - bottom drawer, drag down to close */}
      <Drawer open={isAIOpen} onOpenChange={setIsAIOpen} shouldScaleBackground={false}>
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
