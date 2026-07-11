import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SimulatedActivity } from '@/lib/simulation/simulationEngine';

interface ActivityStore {
  activities: SimulatedActivity[];
  isSimulationRunning: boolean;
  simulationSpeed: 'slow' | 'normal' | 'fast';
  
  // Actions
  addActivity: (activity: SimulatedActivity) => void;
  addActivities: (activities: SimulatedActivity[]) => void;
  clearActivities: () => void;
  setSimulationRunning: (running: boolean) => void;
  setSimulationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  
  // Selectors
  getActivitiesByDeal: (dealId: number) => SimulatedActivity[];
  getActivitiesByStakeholder: (stakeholderId: number) => SimulatedActivity[];
  getRecentActivities: (count?: number) => SimulatedActivity[];
  getActivitiesByType: (type: SimulatedActivity['type']) => SimulatedActivity[];
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],
      isSimulationRunning: false,
      simulationSpeed: 'normal',

      addActivity: (activity) => {
        set((state) => ({
          activities: [activity, ...state.activities].slice(0, 200) // Keep max 200 activities
        }));
      },

      addActivities: (activities) => {
        set((state) => ({
          activities: [...activities, ...state.activities]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 200)
        }));
      },

      clearActivities: () => set({ activities: [] }),

      setSimulationRunning: (running) => set({ isSimulationRunning: running }),

      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

      getActivitiesByDeal: (dealId) => {
        return get().activities.filter(a => a.dealId === dealId);
      },

      getActivitiesByStakeholder: (stakeholderId) => {
        return get().activities.filter(a => a.stakeholderId === stakeholderId);
      },

      getRecentActivities: (count = 20) => {
        return get().activities.slice(0, count);
      },

      getActivitiesByType: (type) => {
        return get().activities.filter(a => a.type === type);
      },
    }),
    {
      name: 'loomik-activity-storage',
      partialize: (state) => ({ 
        activities: state.activities.slice(0, 50),
        simulationSpeed: state.simulationSpeed
      }),
      // Handle Date serialization properly
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          // Convert timestamp strings back to Date objects
          if (data.state?.activities) {
            data.state.activities = data.state.activities.map((a: SimulatedActivity) => ({
              ...a,
              timestamp: a.timestamp ? new Date(a.timestamp) : new Date()
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
