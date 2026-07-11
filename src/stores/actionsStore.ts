import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Stakeholder {
  id: number;
  name: string;
  role: string;
  avatar?: string;
}

export interface Action {
  id: number;
  title: string;
  stakeholders: Stakeholder[];
  artifact: string;
  basedOn: string;
  priority: "high" | "medium" | "low";
  type: "email" | "meeting";
  deadline: string;
  dealName: string;
  dealValue: string;
  companyName: string;
  companyLogo: string;
  winProbability: number;
  status: "active" | "done" | "archived";
  completedAt?: Date;
}

interface ActionsStore {
  archivedActions: Action[];
  doneActions: Action[];
  archiveAction: (action: Action) => void;
  markAsDone: (action: Action) => void;
  unarchiveAction: (actionId: number) => void;
  undoDoneAction: (actionId: number) => void;
  getHistoryActions: () => Action[];
}

export const useActionsStore = create<ActionsStore>()(
  persist(
    (set, get) => ({
      archivedActions: [],
      doneActions: [],
      
      archiveAction: (action: Action) => {
        set((state) => ({
          archivedActions: [
            ...state.archivedActions,
            { ...action, status: "archived", completedAt: new Date() }
          ]
        }));
      },
      
      markAsDone: (action: Action) => {
        set((state) => ({
          doneActions: [
            ...state.doneActions,
            { ...action, status: "done", completedAt: new Date() }
          ]
        }));
      },
      
      unarchiveAction: (actionId: number) => {
        set((state) => ({
          archivedActions: state.archivedActions.filter(a => a.id !== actionId)
        }));
      },
      
      undoDoneAction: (actionId: number) => {
        set((state) => ({
          doneActions: state.doneActions.filter(a => a.id !== actionId)
        }));
      },
      
      getHistoryActions: () => {
        const state = get();
        return [...state.archivedActions, ...state.doneActions].sort(
          (a, b) => (new Date(b.completedAt || 0).getTime()) - (new Date(a.completedAt || 0).getTime())
        );
      },
    }),
    {
      name: 'actions-storage',
      // Handle Date serialization properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert completedAt strings back to Date objects
          if (data.state) {
            if (data.state.archivedActions) {
              data.state.archivedActions = data.state.archivedActions.map((a: Action) => ({
                ...a,
                completedAt: a.completedAt ? new Date(a.completedAt) : undefined
              }));
            }
            if (data.state.doneActions) {
              data.state.doneActions = data.state.doneActions.map((a: Action) => ({
                ...a,
                completedAt: a.completedAt ? new Date(a.completedAt) : undefined
              }));
            }
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
