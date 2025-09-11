import {create} from "zustand";

type Coordinates = {
    XCoordinate: number;
    YCoordinate: number;
}

type PointOnMapState = {
    coordinates: Coordinates | null;
    setCoordinate: (coords: Coordinates) => void;
    resetCoordinates: () => void;
}

export const useStoreAddPointOnMap = create<PointOnMapState>((set) => ({
    coordinates: null,
    setCoordinate: (coords) =>
        set(() => ({coordinates: coords})),
    resetCoordinates: () =>
        set(() => ({coordinates: null})),
}));
