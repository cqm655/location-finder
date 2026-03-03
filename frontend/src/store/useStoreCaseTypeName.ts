// În store/useStoreFilters.ts (exemplu)
import {create} from "zustand";

export const useStoreCaseTypeName = create((set) => ({
    selectedOrgs: {
        Ambulanță: true,
        Poliție: true,
        Pompieri: true
        ,
    },
    setOrg: (name: string, val: number) => set((state) => ({
        selectedOrgs: {...state.selectedOrgs, [name]: val}
    }))
}));
