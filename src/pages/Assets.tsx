import { useState, useEffect, useMemo } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchStore } from "@/stores/searchStore";
import Header from "@/components/dashboard/Header";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ChevronLeft, ChevronRight, Upload, Filter, Eye, Download, Trash2, FileText, Video, FileSpreadsheet, File, Image, FolderOpen, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAssetsStore, Asset, AssetType, ASSET_CATEGORIES } from "@/stores/assetsStore";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Get icon and color based on asset type
const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case "PDF":
      return { icon: FileText, color: "text-red-500", bg: "bg-red-50" };
    case "VIDEO":
      return { icon: Video, color: "text-purple", bg: "bg-purple/10" };
    case "XLSX":
      return { icon: FileSpreadsheet, color: "text-green", bg: "bg-green/10" };
    case "DOCX":
      return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
    case "PPTX":
      return { icon: FileText, color: "text-orange-500", bg: "bg-orange-50" };
    case "IMG":
      return { icon: Image, color: "text-pink-500", bg: "bg-pink-50" };
    default:
      return { icon: File, color: "text-muted-foreground", bg: "bg-muted" };
  }
};

// Get category badge color
const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Presentations": "bg-purple/10 text-purple border-purple/20",
    "Marketing": "bg-pink-50 text-pink-600 border-pink-200",
    "Case Studies": "bg-blue-50 text-blue-600 border-blue-200",
    "Tools": "bg-green/10 text-green border-green/20",
    "Branding": "bg-orange-50 text-orange-600 border-orange-200",
    "Compliance": "bg-red-50 text-red-600 border-red-200",
    "Documentation": "bg-slate-100 text-slate-600 border-slate-200",
    "Templates": "bg-indigo-50 text-indigo-600 border-indigo-200",
    "Proposals": "bg-cyan-50 text-cyan-600 border-cyan-200",
    "Security": "bg-amber-50 text-amber-700 border-amber-200",
    "Contracts": "bg-violet-50 text-violet-600 border-violet-200",
    "Financial": "bg-emerald-50 text-emerald-600 border-emerald-200",
    "Technical": "bg-zinc-100 text-zinc-600 border-zinc-200",
  };
  return colors[category] || "bg-muted text-muted-foreground border-border";
};

// Format date
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  });
};

type SortOption = "newest" | "oldest" | "name" | "size";

const Assets = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();
  const isMobile = useIsMobile();
  const { query: searchQuery } = useSearchStore();
  
  const { assets, deleteAsset } = useAssetsStore();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dealFilter, setDealFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Fetch deals for filtering
  const { data: deals = [] } = useQuery({
    queryKey: ['deals-for-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('id, company')
        .order('company');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById("main-scroll");
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 60);
      }
    };

    const mainContent = document.getElementById("main-scroll");
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = assets.filter(asset => {
      const matchesSearch = searchQuery === "" || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      const matchesDeal = dealFilter === "all" || asset.dealId?.toString() === dealFilter;
      
      return matchesSearch && matchesCategory && matchesDeal;
    });

    // Sort
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "size":
        result.sort((a, b) => {
          const parseSize = (s: string) => {
            const match = s.match(/([\d.]+)\s*(KB|MB|GB)/i);
            if (!match) return 0;
            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit === 'KB') return value;
            if (unit === 'MB') return value * 1024;
            if (unit === 'GB') return value * 1024 * 1024;
            return value;
          };
          return parseSize(b.size) - parseSize(a.size);
        });
        break;
    }

    return result;
  }, [assets, searchQuery, categoryFilter, dealFilter, sortBy]);

  // Handle delete confirmation
  const handleDeleteClick = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      deleteAsset(assetToDelete.id);
      toast({
        title: "File moved to trash",
        description: `"${assetToDelete.name}" has been moved to History → Trash.`,
      });
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  // Handle download (mock)
  const handleDownload = (asset: Asset, e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Download started",
      description: `Downloading "${asset.name}"...`,
    });
  };

  // Handle view - opens PDF in new tab if URL exists
  const handleView = (asset: Asset) => {
    if (asset.url) {
      window.open(asset.url, '_blank');
    } else {
      toast({
        title: "Preview not available",
        description: `"${asset.name}" doesn't have a viewable URL yet.`,
      });
    }
  };

  // Handle upload (mock)
  const handleUpload = () => {
    toast({
      title: "Upload dialog",
      description: "File upload functionality would open here.",
    });
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header - hides on scroll */}
      <div className={`transition-all duration-200 ${isScrolled ? "h-0 opacity-0 overflow-hidden" : ""}`}>
        <Header isScrolled={isScrolled} />
      </div>
      
      {/* Tab Navigation + AI Header - side by side */}
      <div className="flex border-b border-border bg-white">
        <div className="flex-1">
          <TabNavigation isScrolled={isScrolled} activeTab="Assets" />
        </div>
        
        {/* AI Header - collapsible toggle - ONLY tablet/desktop */}
        {!isMobile && (
          <div className={`flex items-center gap-2 px-2 md:px-4 border-l border-border transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-10 md:w-12"}`}>
            {isAIPanelOpen && (
              <>
                <img src="/assets/loomik-icon.svg" alt="Loomik" className="h-4 md:h-5 w-auto" />
                <div className="w-2 h-2 bg-green rounded-full" />
              </>
            )}
            <button 
              onClick={toggleAIPanel}
              className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            >
              {isAIPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - scrollable, full width on mobile */}
        <main id="main-scroll" className={`flex-1 overflow-y-auto ${isMobile ? 'pb-20' : ''}`}>
          {/* Filter Bar - Single line normally, 2 lines when AI panel open on tablet */}
          <div className={`px-4 py-2 border-b border-border bg-white ${isAIPanelOpen ? 'md:flex-col md:space-y-2 lg:flex-row lg:space-y-0' : ''} flex items-center justify-between gap-3`}>
            {/* Left: Filters */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Filter className="w-4 h-4 text-muted-foreground" />
              
              {/* Deal Filter */}
              <Select value={dealFilter} onValueChange={setDealFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="All Deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deals</SelectItem>
                  {deals.map(deal => (
                    <SelectItem key={deal.id} value={deal.id}>{deal.company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ASSET_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <span className="text-xs text-muted-foreground hidden xl:inline">
                Showing {filteredAssets.length} of {assets.length} assets
              </span>
            </div>
            
            {/* Right: Sort + Upload */}
            <div className={`flex items-center gap-2 ${isAIPanelOpen ? 'md:w-full md:justify-between lg:w-auto lg:justify-end' : ''}`}>
              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[100px] h-8 text-xs">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>

              {/* Upload Button */}
              <Button 
                onClick={handleUpload}
                size="sm"
                className="bg-gradient-to-r from-purple to-orange hover:opacity-90 text-white gap-1.5 h-8"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            </div>
          </div>

          {/* Content - Cards Only */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredAssets.map((asset) => {
                const { icon: Icon, color, bg } = getAssetIcon(asset.type);
                // Border color based on file type
                const borderColor = asset.type === "PDF" ? "border-l-red-500" 
                  : asset.type === "VIDEO" ? "border-l-purple" 
                  : asset.type === "XLSX" ? "border-l-green" 
                  : asset.type === "DOCX" ? "border-l-blue-500" 
                  : "border-l-muted-foreground/30";
                
                return (
                  <Card 
                    key={asset.id} 
                    className={`group p-2 border-l-4 ${borderColor} interactive-card interactive-card-gradient flex flex-col relative cursor-pointer`}
                    onClick={() => handleView(asset)}
                  >
                    {/* Ambient glow effect */}
                    <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-purple/20 via-primary/10 to-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
                    
                    {/* Header: Icon + Type */}
                    <div className="flex items-center justify-between mb-1">
                      <div className={`w-6 h-6 rounded ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3 h-3 ${color}`} />
                      </div>
                      <span className="text-xxs text-muted-foreground uppercase">{asset.type}</span>
                    </div>

                    {/* Name */}
                    <p className="font-medium text-xs text-foreground truncate mb-0.5" title={asset.name}>
                      {asset.name}
                    </p>
                    
                    {/* Size */}
                    <p className="text-xxs text-muted-foreground mb-1">{asset.size}</p>

                    {/* Category Badge */}
                    <Badge variant="outline" className={`text-xxs px-1 py-0 w-fit ${getCategoryColor(asset.category)}`}>
                      {asset.category}
                    </Badge>

                    {/* Actions Footer */}
                    <div className="flex items-center gap-0.5 mt-auto pt-1.5 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => { e.stopPropagation(); handleView(asset); }}
                        title="View"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => handleDownload(asset, e)}
                        title="Download"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(asset, e)}
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredAssets.length === 0 && (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No assets found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery || categoryFilter !== "all" || dealFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Upload files to start building your assets library."}
                </p>
                <Button onClick={handleUpload} variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Files
                </Button>
              </Card>
            )}
          </div>
        </main>

        {/* AI Chat Sidebar - ONLY tablet/desktop */}
        {!isMobile && (
          <aside className={`border-l border-border bg-card flex flex-col overflow-hidden transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-0"}`}>
            {isAIPanelOpen && <AIChatPanel hideHeader />}
          </aside>
        )}
      </div>

      {/* Bottom Nav + AI Sheet - ONLY mobile */}
      {isMobile && <MobileBottomNav />}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              "{assetToDelete?.name}" will be moved to History → Trash. You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Assets;
