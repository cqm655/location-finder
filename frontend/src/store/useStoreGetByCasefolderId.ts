import {create} from "zustand";

interface CasefolderStore {
    casefolderId: string;
    isLoading: boolean;
    setCasefolderId: (id: string) => void;
    setLoading: (isLoading: boolean) => void;
}

export const useStateCasefolderId = create<CasefolderStore>((set) => ({
    casefolderId: "",
    isLoading: false,
    setLoading: (isLoading: boolean) => {
        set({isLoading});
    },
    setCasefolderId: (id: string) => {
        set({casefolderId: id});
    },
}));
