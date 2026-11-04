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
import { categoryBadge, selectedChip, unselectedChip } from "@/lib/tone";

// Get icon based on asset type
const getAssetIcon = (type: AssetType) => {
  switch (type) {
    case "PDF":
    case "DOCX":
    case "PPTX":
      return FileText;
    case "VIDEO":
      return Video;
    case "XLSX":
      return FileSpreadsheet;
    case "IMG":
      return Image;
    default:
      return File;
  }
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
            <div className="p-2 rounded-lg bg-primary-subtle">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Assets Library</h3>
              <p className="text-sm text-muted-foreground">Manage and organize your deal documents and files</p>
            </div>
          </div>
          <Button 
            onClick={handleUpload}
            className="gap-2"
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
            className="pl-9 bg-card"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Category Filter */}
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-card">
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
              className={`p-2 transition-colors ${viewMode === "grid" ? selectedChip : unselectedChip}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? selectedChip : unselectedChip}`}
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
            const Icon = getAssetIcon(asset.type);
            return (
              <Card key={asset.id} className="group relative p-4 border-0 bg-muted/30 interactive-card">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" title={asset.name}>
                      {asset.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{asset.size}</p>
                  </div>
                </div>

                <Badge variant="outline" className={`mb-2 text-xs border-transparent ${categoryBadge}`}>
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
                    <span className="truncate max-w-20">{asset.uploadedBy}</span>
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
                    className="h-8 w-8 text-danger hover:text-danger hover:bg-danger-subtle"
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
                <TableHead className="w-100">Name</TableHead>
                <TableHead className="w-20">Type</TableHead>
                <TableHead className="w-25">Size</TableHead>
                <TableHead className="w-30">Category</TableHead>
                <TableHead className="w-35">Uploaded By</TableHead>
                <TableHead className="w-25">Date</TableHead>
                <TableHead className="w-30 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.map((asset) => {
                const Icon = getAssetIcon(asset.type);
                return (
                  <TableRow key={asset.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-muted">
                          <Icon className="w-4 h-4 text-muted-foreground" />
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
                      <Badge variant="outline" className={`text-xs border-transparent ${categoryBadge}`}>
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
                          className="h-8 w-8 text-danger hover:text-danger hover:bg-danger-subtle"
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
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
