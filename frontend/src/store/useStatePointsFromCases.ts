import {create} from "zustand";

export interface PointStore {
    lng: number;
    lat: number;
    caseIndex1Name: string;
    caseIndex2Name: string;
    created: Date;
    caseFolderId: number;
    caseTypeId: number;
    creator: string;
    XCoordinate: number;
    YCoordinate: number;
}

interface CasePointsMapStore {
    point: PointStore[],
    setPoint: (newPoint: PointStore[]) => void,
    resetPoints: () => void,
}

export const useStatePointsFromCases = create<CasePointsMapStore>((set) => ({
    point: [],
    setPoint: (newPoint: PointStore[]) => set(({point: newPoint})),
    resetPoints: () => set({point: []})
}))
