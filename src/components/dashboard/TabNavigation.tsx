import { useState, useEffect } from "react";
import { Activity, Zap, Eye, Calendar, Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";
import { useSearchStore } from "@/stores/searchStore";
import { useIsTablet, useIsMobile } from "@/hooks/use-mobile";
import { MobileSearchModal } from "@/components/MobileSearchModal";
import { selectedChip, unselectedChip } from "@/lib/tone";

interface TabNavigationProps {
  isScrolled?: boolean;
  activeTab?: string;
}

const TabNavigation = ({ isScrolled = false, activeTab }: TabNavigationProps) => {
  const location = useLocation();
  const { query, setQuery, clearQuery } = useSearchStore();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  // Use icon-only mode for both tablet and mobile
  const useIconOnly = isTablet || isMobile;
  
  // Clear search when navigating between tabs
  useEffect(() => {
    clearQuery();
  }, [location.pathname, clearQuery]);
  
  const tabs = [
    { label: "Dashboard", icon: Activity, path: "/" },
    { label: "Action Hub", icon: Zap, path: "/action-hub" },
    { label: "Deal GPS", icon: Eye, path: "/deal-gps" },
    { label: "Calendar", icon: Calendar, path: "/calendar" },
    { label: "Assets", icon: FolderOpen, path: "/assets" },
  ];

  const isActive = (tab: { label: string; path: string }) => {
    if (activeTab) return tab.label === activeTab;
    return location.pathname === tab.path;
  };

  // Get search placeholder based on current tab
  const getSearchPlaceholder = () => {
    const currentPath = location.pathname;
    if (currentPath === "/action-hub") return "Search actions...";
    if (currentPath === "/deal-gps") return "Search deals...";
    if (currentPath === "/calendar") return "Search events...";
    return "Search deals...";
  };

  return (
    <>
      <div className={`${isMobile ? 'px-3' : 'px-6'} py-2`}>
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex items-center justify-center gap-1 rounded font-medium transition-all ${
                useIconOnly 
                  ? "p-2.5" 
                  : "px-3 py-1 text-xs"
              } ${
                isActive(tab) ? selectedChip : unselectedChip
              }`}
              title={tab.label}
            >
              <tab.icon className={useIconOnly ? "w-4 h-4" : "w-3 h-3"} />
              {!useIconOnly && tab.label}
            </Link>
          ))}
          
          {/* Desktop/Tablet Search - hidden on mobile */}
          {!isMobile && (
            <div className="relative ml-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input 
                placeholder={getSearchPlaceholder()}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 w-48 h-7 text-xs bg-muted border-0"
              />
            </div>
          )}
          
          {/* Mobile Search Button */}
          {isMobile && (
            <button 
              onClick={() => setMobileSearchOpen(true)}
              className="ml-auto p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </nav>
      </div>
      
      {/* Mobile Search Modal */}
      <MobileSearchModal 
        open={mobileSearchOpen} 
        onOpenChange={setMobileSearchOpen}
        placeholder={getSearchPlaceholder()}
      />
    </>
  );
};

export default TabNavigation;
