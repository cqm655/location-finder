import {create} from 'zustand';

interface SidebarState {
    isOpen: boolean;
    openSidebar: () => void;
    closeSidebar: () => void;
    toggleSidebar: () => void; // Adaugă această funcție
}

export const useStoreToggleSideBar = create<SidebarState>((set) => ({
    isOpen: false,
    openSidebar: () => set({isOpen: true}),
    closeSidebar: () => set({isOpen: false}),
    toggleSidebar: () => set((state) => ({isOpen: !state.isOpen})), // Schimbă starea din true în false și invers
}));
