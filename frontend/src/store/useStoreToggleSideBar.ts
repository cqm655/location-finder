import {create} from "zustand";

type SideBarState = {
    isOpen: boolean;
    openSidebar: () => void;
};

export const useStoreToggleSideBar = create<SideBarState>((set) => ({
    isOpen: false,
    openSidebar: () => set((state) => ({isOpen: !state.isOpen})),
}));
