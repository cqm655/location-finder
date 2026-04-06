import {create} from "zustand";
import type {ApiCaseFolderIdResponse} from "../connect/types.ts";


export interface CasefolderDataStore {
    data: ApiCaseFolderIdResponse[] | null,
    setCaseFolderData: (data: ApiCaseFolderIdResponse[]) => void,
    resetCaseFolderData: () => void;
}

export const useStoreSetSideBardAccordionData = create<CasefolderDataStore>((set) => ({
    data: null,
    setCaseFolderData: (newData) =>
        set(() => ({
            data: Array.isArray(newData) ? newData : [newData],
        })),
    resetCaseFolderData: () => set({data: []}),
}));
