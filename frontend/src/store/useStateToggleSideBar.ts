import {create} from "zustand";

type SideBarState = {
    isOpen: boolean;
    openSidebar: () => void;
};

export const useStateToggleSideBar = create<SideBarState>((set) => ({
    isOpen: false,
    openSidebar: () => set((state) => ({isOpen: !state.isOpen})),
}));
