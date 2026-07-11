// Store for actions generated from signals/risks processing
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GeneratedAction {
  id: number;
  title: string;
  stakeholderIds: number[];
  artifact: string;
  basedOn: string;
  priority: "high" | "medium" | "low";
  type: "email" | "meeting";
  deadline: string;
  dealId: number;
  signalId?: string;
  createdAt: Date;
  status: "pending" | "done" | "archived";
}

interface GeneratedActionsStore {
  actions: GeneratedAction[];
  lastProcessingResult: {
    actionsAdded: number;
    actionsModified: number;
    probabilityChange: number;
    alignmentChange: number;
    actions: GeneratedAction[];
  } | null;
  
  // Actions
  addActions: (actions: Omit<GeneratedAction, 'createdAt' | 'status'>[]) => GeneratedAction[];
  setLastResult: (result: GeneratedActionsStore['lastProcessingResult']) => void;
  clearLastResult: () => void;
  getActionsBySignal: (signalId: string) => GeneratedAction[];
  getActionsByDeal: (dealId: number) => GeneratedAction[];
  getPendingActions: () => GeneratedAction[];
}

export const useGeneratedActionsStore = create<GeneratedActionsStore>()(
  persist(
    (set, get) => ({
      actions: [],
      lastProcessingResult: null,
      
      addActions: (newActions) => {
        const createdActions: GeneratedAction[] = newActions.map(action => ({
          ...action,
          createdAt: new Date(),
          status: "pending" as const,
        }));
        
        set((state) => ({
          actions: [...createdActions, ...state.actions].slice(0, 100),
        }));
        
        return createdActions;
      },
      
      setLastResult: (result) => {
        set({ lastProcessingResult: result });
      },
      
      clearLastResult: () => {
        set({ lastProcessingResult: null });
      },
      
      getActionsBySignal: (signalId) => {
        return get().actions.filter(a => a.signalId === signalId);
      },
      
      getActionsByDeal: (dealId) => {
        return get().actions.filter(a => a.dealId === dealId);
      },
      
      getPendingActions: () => {
        return get().actions.filter(a => a.status === "pending");
      },
    }),
    {
      name: 'loomik-generated-actions-storage',
      partialize: (state) => ({
        actions: state.actions.slice(0, 50),
      }),
      // Handle Date serialization properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert createdAt strings back to Date objects
          if (data.state?.actions) {
            data.state.actions = data.state.actions.map((a: GeneratedAction) => ({
              ...a,
              createdAt: a.createdAt ? new Date(a.createdAt) : new Date()
            }));
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
