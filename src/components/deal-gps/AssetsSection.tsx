import { useState, useMemo } from "react";
import { 
  Search, 
  Upload, 
  Filter, 
  LayoutGrid, 
  List, 
  Eye, 
  Download, 
  Trash2,
  FileText,
  Video,
  FileSpreadsheet,
  File,
  Image,
  FolderOpen,
  User,
  Calendar
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssetsStore, Asset, AssetType, ASSET_CATEGORIES } from "@/stores/assetsStore";
import { toast } from "@/hooks/use-toast";

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

export const AssetsSection = () => {
  const { assets, deleteAsset } = useAssetsStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = searchQuery === "" || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, categoryFilter]);

  // Handle delete confirmation
  const handleDeleteClick = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      deleteAsset(assetToDelete.id);
      toast({
        title: "File moved to trash",
        description: `"${assetToDelete.name}" has been moved to History → Trash.`,
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              // This would be connected to restore functionality
              toast({ title: "File restored" });
            }}
          >
            Undo
          </Button>
        ),
      });
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
    }
  };

  // Handle download (mock)
  const handleDownload = (asset: Asset) => {
    toast({
      title: "Download started",
      description: `Downloading "${asset.name}"...`,
    });
  };

  // Handle view (mock)
  const handleView = (asset: Asset) => {
    toast({
      title: "Opening preview",
      description: `Opening "${asset.name}" in preview mode...`,
    });
  };

  // Handle upload (mock)
  const handleUpload = () => {
    toast({
      title: "Upload dialog",
      description: "File upload functionality would open here.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple/10">
              <FolderOpen className="w-5 h-5 text-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-purple">Assets Library</h3>
              <p className="text-sm text-muted-foreground">Manage and organize your deal documents and files</p>
            </div>
          </div>
          <Button 
            onClick={handleUpload}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </div>
      </Card>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files, descriptions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Category Filter */}
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {ASSET_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-purple text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-purple text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const { icon: Icon, color, bg } = getAssetIcon(asset.type);
            return (
              <Card key={asset.id} className="group relative p-4 border-0 bg-muted/30 interactive-card interactive-card-gradient">
                {/* Ambient glow effect */}
                <div className="absolute -inset-px rounded-lg bg-gradient-to-r from-purple/20 via-primary/10 to-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" title={asset.name}>
                      {asset.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{asset.size}</p>
                  </div>
                </div>

                <Badge variant="outline" className={`mb-2 text-xs ${getCategoryColor(asset.category)}`}>
                  {asset.category}
                </Badge>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {asset.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {asset.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {asset.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      +{asset.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{asset.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(asset.uploadedAt)}</span>
                  </div>
                </div>

                {/* Actions - show on hover */}
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleView(asset)}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleDownload(asset)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteClick(asset)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[400px]">Name</TableHead>
                <TableHead className="w-[80px]">Type</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[140px]">Uploaded By</TableHead>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const { icon: Icon, color, bg } = getAssetIcon(asset.type);
                return (
                  <TableRow key={asset.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${bg}`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{asset.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {asset.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {asset.size}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(asset.category)}`}>
                        {asset.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {asset.uploadedBy}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(asset.uploadedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleView(asset)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleDownload(asset)}
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteClick(asset)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty State */}
      {filteredAssets.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-1">No assets found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "Upload files to start building your assets library."}
          </p>
          <Button onClick={handleUpload} variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Button>
        </Card>
      )}

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
