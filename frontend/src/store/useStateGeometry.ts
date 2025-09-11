import {create} from "zustand";
import type {ApiPolygoneResponse} from "../connect/types.ts";


interface GeometryStore {
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
    setGeometry: (geometry: ApiPolygoneResponse['geometry']) => void;
    geometry: { latitude: number[], longitude: number[] }
}

export const useStateGeometry = create<GeometryStore>((set) => ({
    isLoading: false,
    geometry: {latitude: [], longitude: []},
    setLoading: (isLoading: boolean) => {
        set({isLoading});
    },
    setGeometry: (geometry) => {
        set({geometry});
    }
}));
