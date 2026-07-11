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

// Sample assets data with real PDF URLs
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
    url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf",
  },
  {
    id: "asset-2",
    name: "Product Demo Video",
    description: "Product demonstration for clients",
    type: "VIDEO",
    size: "45.2 MB",
    category: "Marketing",
    tags: ["demo", "product"],
    uploadedBy: "Mike Johnson",
    uploadedAt: new Date("2024-01-13"),
  },
  {
    id: "asset-3",
    name: "Pricing Calculator",
    description: "Interactive pricing calculator",
    type: "XLSX",
    size: "856 KB",
    category: "Tools",
    tags: ["pricing", "calculator"],
    uploadedBy: "David Wilson",
    uploadedAt: new Date("2024-01-11"),
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
    url: "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf",
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
    url: "https://www.africau.edu/images/default/sample.pdf",
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
    url: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
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
    url: "https://www.orimi.com/pdf-test.pdf",
  },
  {
    id: "asset-8",
    name: "Proposal Template",
    description: "Enterprise proposal template",
    type: "DOCX",
    size: "1.2 MB",
    category: "Templates",
    tags: ["proposal", "template"],
    uploadedBy: "Mike Johnson",
    uploadedAt: new Date("2024-01-04"),
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
    url: "https://www.africau.edu/images/default/sample.pdf",
  },
  {
    id: "asset-10",
    name: "Revenue Forecast",
    description: "Q1 revenue projections",
    type: "XLSX",
    size: "2.1 MB",
    category: "Financial",
    tags: ["revenue", "forecast"],
    uploadedBy: "David Wilson",
    uploadedAt: new Date("2024-01-02"),
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
    url: "https://www.clickdimensions.com/links/TestPDFfile.pdf",
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
    url: "https://www.orimi.com/pdf-test.pdf",
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
