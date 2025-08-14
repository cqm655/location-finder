import {create} from "zustand";

type Point = {
    lng: number;
    lat: number;
};

type CasePointsMapState = {
    point: Point[],
    setPoint: (newPoint: Point[]) => void,
    resetPoints: () => void,
}

export const useStatePointsFromCases = create<CasePointsMapState>((set) => ({
    point: [],
    setPoint: (newPoint: Point[]) => set(({point: newPoint})),
    resetPoints: () => set({point: []})
}))
