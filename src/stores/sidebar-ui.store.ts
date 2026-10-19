import { create } from 'zustand';

type SidebarUIState = {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
};

export const useSidebarUIStore = create<SidebarUIState>((set) => ({
  isCollapsed: false,
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
