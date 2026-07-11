import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CriticalEventCategory = 
  | 'stakeholder_departure' 
  | 'stakeholder_arrival' 
  | 'budget_approved' 
  | 'budget_frozen'
  | 'contract_signed' 
  | 'org_change' 
  | 'deal_blocked';

export interface DetectedSignal {
  id: string;
  type: 'signal' | 'risk';
  name: string;
  trigger: string;
  evidence: string;
  dealId: number;
  dealName: string;
  stakeholder?: {
    id: number;
    name: string;
    role: string;
    avatar?: string;
  };
  priority: 'high' | 'medium' | 'low';
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence: number;
  suggestedAction?: string;
  channel: string;
  detectedAt: Date;
  isUrgent: boolean;
  status: 'pending' | 'processed' | 'ignored';
  processedAt?: Date;
  actionsGenerated?: number[];
  // Critical event fields
  severity?: 'critical' | 'normal';
  eventCategory?: CriticalEventCategory;
}

interface SignalsStore {
  signals: DetectedSignal[];
  isProcessing: boolean;
  lastProcessedAt: Date | null;
  
  // Actions
  addSignal: (signal: Omit<DetectedSignal, 'id' | 'detectedAt' | 'status'>) => void;
  processSignal: (id: string, actionIds?: number[]) => void;
  ignoreSignal: (id: string) => void;
  unignoreSignal: (id: string) => void;
  ignoreAllSignals: (type?: 'signal' | 'risk') => void;
  processAllSignals: (type?: 'signal' | 'risk') => void;
  setProcessing: (isProcessing: boolean) => void;
  resetStore: () => void;
  updateSignal: (id: string, updates: Partial<Pick<DetectedSignal, 'trigger' | 'evidence' | 'suggestedAction'>>) => void;
  
  // Selectors
  getPendingSignals: () => DetectedSignal[];
  getPendingRisks: () => DetectedSignal[];
  getProcessedSignals: () => DetectedSignal[];
  getIgnoredSignals: () => DetectedSignal[];
  getSignalsByDeal: (dealId: number) => DetectedSignal[];
  getRiskCount: () => number;
  getSignalCount: () => number;
}

export const useSignalsStore = create<SignalsStore>()(
  persist(
    (set, get) => ({
      signals: [],
      isProcessing: false,
      lastProcessedAt: null,

      addSignal: (signalData) => {
        const signal: DetectedSignal = {
          ...signalData,
          id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          detectedAt: new Date(),
          status: 'pending',
        };
        set((state) => ({
          signals: [signal, ...state.signals].slice(0, 100) // Keep max 100 signals
        }));
      },

      processSignal: (id, actionIds) => {
        set((state) => ({
          signals: state.signals.map(s => 
            s.id === id 
              ? { ...s, status: 'processed' as const, processedAt: new Date(), actionsGenerated: actionIds }
              : s
          ),
          lastProcessedAt: new Date()
        }));
      },

      ignoreSignal: (id) => {
        set((state) => ({
          signals: state.signals.map(s => 
            s.id === id 
              ? { ...s, status: 'ignored' as const, processedAt: new Date() }
              : s
          )
        }));
      },

      unignoreSignal: (id) => {
        set((state) => ({
          signals: state.signals.map(s => 
            s.id === id 
              ? { ...s, status: 'pending' as const, processedAt: undefined }
              : s
          )
        }));
      },

      ignoreAllSignals: (type) => {
        set((state) => ({
          signals: state.signals.map(s => 
            (s.status === 'pending' && (!type || s.type === type))
              ? { ...s, status: 'ignored' as const, processedAt: new Date() }
              : s
          )
        }));
      },

      updateSignal: (id, updates) => {
        set((state) => ({
          signals: state.signals.map(s => 
            s.id === id 
              ? { ...s, ...updates }
              : s
          )
        }));
      },

      processAllSignals: (type) => {
        set((state) => ({
          signals: state.signals.map(s => 
            (s.status === 'pending' && (!type || s.type === type))
              ? { ...s, status: 'processed' as const, processedAt: new Date() }
              : s
          ),
          lastProcessedAt: new Date()
        }));
      },

      setProcessing: (isProcessing) => set({ isProcessing }),

      resetStore: () => {
        localStorage.removeItem('loomik-signals-storage');
        set({ signals: [], isProcessing: false, lastProcessedAt: null });
      },

      getPendingSignals: () => {
        return get().signals.filter(s => s.status === 'pending' && s.type === 'signal');
      },

      getPendingRisks: () => {
        return get().signals.filter(s => s.status === 'pending' && s.type === 'risk');
      },

      getProcessedSignals: () => {
        return get().signals.filter(s => s.status === 'processed');
      },

      getIgnoredSignals: () => {
        return get().signals.filter(s => s.status === 'ignored');
      },

      getSignalsByDeal: (dealId) => {
        return get().signals.filter(s => s.dealId === dealId);
      },

      getRiskCount: () => {
        return get().signals.filter(s => s.status === 'pending' && s.type === 'risk').length;
      },

      getSignalCount: () => {
        return get().signals.filter(s => s.status === 'pending' && s.type === 'signal').length;
      },
    }),
    {
      name: 'loomik-signals-storage',
      partialize: (state) => ({ 
        signals: state.signals.slice(0, 50) // Only persist 50 most recent
      }),
      // Handle Date serialization properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert date strings back to Date objects
          if (data.state?.signals) {
            data.state.signals = data.state.signals.map((s: DetectedSignal) => ({
              ...s,
              detectedAt: s.detectedAt ? new Date(s.detectedAt) : new Date(),
              processedAt: s.processedAt ? new Date(s.processedAt) : undefined
            }));
          }
          if (data.state?.lastProcessedAt) {
            data.state.lastProcessedAt = new Date(data.state.lastProcessedAt);
          }
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
