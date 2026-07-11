import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AssetCategory = 
  | "Presentations" 
  | "Marketing" 
  | "Case Studies" 
  | "Tools" 
  | "Branding" 
  | "Compliance" 
  | "Documentation" 
  | "Templates" 
  | "Proposals" 
  | "Security" 
  | "Contracts" 
  | "Financial" 
  | "Technical";

export type AssetType = "PDF" | "VIDEO" | "XLSX" | "DOCX" | "PPTX" | "IMG" | "OTHER";

export interface Asset {
  id: string;
  name: string;
  description: string;
  type: AssetType;
  size: string;
  category: AssetCategory;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  dealId?: number;
  url?: string;
}

export interface TrashedAsset extends Asset {
  trashedAt: Date;
}

interface AssetsStore {
  assets: Asset[];
  trashedAssets: TrashedAsset[];
  addAsset: (asset: Omit<Asset, 'id' | 'uploadedAt'>) => void;
  deleteAsset: (assetId: string) => void;
  restoreAsset: (assetId: string) => void;
  permanentlyDeleteAsset: (assetId: string) => void;
}

// Sample assets — all point at a shared demo PDF hosted in public/samples/.
// Kept only assets whose preview works; the video/xlsx/docx entries were
// removed because the demo file is a PDF.
const SAMPLE_PDF_URL = "/samples/loomik-sample.pdf";

const sampleAssets: Asset[] = [
  {
    id: "asset-1",
    name: "Q4 Sales Presentation",
    description: "Quarterly sales performance and projections",
    type: "PDF",
    size: "2.4 MB",
    category: "Presentations",
    tags: ["sales", "quarterly"],
    uploadedBy: "Sarah Chen",
    uploadedAt: new Date("2024-01-14"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-4",
    name: "SOC2 Compliance Report",
    description: "Security audit results",
    type: "PDF",
    size: "4.1 MB",
    category: "Compliance",
    tags: ["security", "soc2"],
    uploadedBy: "Alex Rodriguez",
    uploadedAt: new Date("2024-01-09"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-5",
    name: "Brand Guidelines",
    description: "Brand identity guidelines",
    type: "PDF",
    size: "12.3 MB",
    category: "Branding",
    tags: ["brand", "guidelines"],
    uploadedBy: "Emma Thompson",
    uploadedAt: new Date("2024-01-08"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-6",
    name: "FinTech Case Study",
    description: "Success story implementation",
    type: "PDF",
    size: "3.7 MB",
    category: "Case Studies",
    tags: ["case study", "fintech"],
    uploadedBy: "Sarah Chen",
    uploadedAt: new Date("2024-01-06"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-7",
    name: "API Documentation",
    description: "Integration guides",
    type: "PDF",
    size: "8.2 MB",
    category: "Technical",
    tags: ["api", "docs"],
    uploadedBy: "James Lee",
    uploadedAt: new Date("2024-01-05"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-9",
    name: "Contract Terms",
    description: "Standard contract terms",
    type: "PDF",
    size: "1.8 MB",
    category: "Contracts",
    tags: ["legal", "contract"],
    uploadedBy: "Lisa Park",
    uploadedAt: new Date("2024-01-03"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-11",
    name: "Security Whitepaper",
    description: "Security architecture overview",
    type: "PDF",
    size: "5.4 MB",
    category: "Security",
    tags: ["security", "architecture"],
    uploadedBy: "Alex Rodriguez",
    uploadedAt: new Date("2024-01-01"),
    url: SAMPLE_PDF_URL,
  },
  {
    id: "asset-12",
    name: "Onboarding Guide",
    description: "Customer onboarding steps",
    type: "PDF",
    size: "3.2 MB",
    category: "Documentation",
    tags: ["onboarding", "guide"],
    uploadedBy: "Emma Thompson",
    uploadedAt: new Date("2023-12-28"),
    url: SAMPLE_PDF_URL,
  },
];

export const useAssetsStore = create<AssetsStore>()(
  persist(
    (set, get) => ({
      assets: sampleAssets,
      trashedAssets: [],
      
      addAsset: (assetData) => {
        const newAsset: Asset = {
          ...assetData,
          id: `asset-${Date.now()}`,
          uploadedAt: new Date(),
        };
        set((state) => ({
          assets: [newAsset, ...state.assets],
        }));
      },
      
      deleteAsset: (assetId) => {
        const asset = get().assets.find(a => a.id === assetId);
        if (asset) {
          const trashedAsset: TrashedAsset = {
            ...asset,
            trashedAt: new Date(),
          };
          set((state) => ({
            assets: state.assets.filter(a => a.id !== assetId),
            trashedAssets: [trashedAsset, ...state.trashedAssets],
          }));
        }
      },
      
      restoreAsset: (assetId) => {
        const trashedAsset = get().trashedAssets.find(a => a.id === assetId);
        if (trashedAsset) {
          const { trashedAt, ...asset } = trashedAsset;
          set((state) => ({
            trashedAssets: state.trashedAssets.filter(a => a.id !== assetId),
            assets: [asset, ...state.assets],
          }));
        }
      },
      
      permanentlyDeleteAsset: (assetId) => {
        set((state) => ({
          trashedAssets: state.trashedAssets.filter(a => a.id !== assetId),
        }));
      },
    }),
    {
      name: 'assets-storage',
      // Bumped when the demo seed changes so cached state is discarded.
      version: 2,
      migrate: () => ({ assets: sampleAssets, trashedAssets: [] }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Hydrate dates
          state.assets = state.assets.map(a => ({
            ...a,
            uploadedAt: new Date(a.uploadedAt),
          }));
          state.trashedAssets = state.trashedAssets.map(a => ({
            ...a,
            uploadedAt: new Date(a.uploadedAt),
            trashedAt: new Date(a.trashedAt),
          }));
        }
      },
    }
  )
);

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Presentations",
  "Marketing",
  "Case Studies",
  "Tools",
  "Branding",
  "Compliance",
  "Documentation",
  "Templates",
  "Proposals",
  "Security",
  "Contracts",
  "Financial",
  "Technical",
];
