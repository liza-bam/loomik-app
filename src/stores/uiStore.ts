import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  isAIPanelOpen: boolean;
  setIsAIPanelOpen: (isOpen: boolean) => void;
  toggleAIPanel: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isAIPanelOpen: true,
      setIsAIPanelOpen: (isOpen) => set({ isAIPanelOpen: isOpen }),
      toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
    }),
    {
      name: 'ui-storage',
    }
  )
);
