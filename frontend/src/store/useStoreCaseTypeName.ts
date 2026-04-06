import {create} from "zustand";


interface CaseTypeState {
    selectedOrgs: {
        Ambulanță: boolean;
        Poliție: boolean;
        Pompieri: boolean;
        [key: string]: boolean; // Permite accesul dinamic prin string (index signature)
    };
    // val este boolean (true/false) conform structurii de mai sus
    setOrg: (name: string, val: boolean) => void;
}

export const useStoreCaseTypeName = create<CaseTypeState>((set) => ({
    selectedOrgs: {
        Ambulanță: true,
        Poliție: true,
        Pompieri: true,
    },
    setOrg: (name, val) =>
        set((state) => ({
            selectedOrgs: {...state.selectedOrgs, [name]: val}
        }))
}));
