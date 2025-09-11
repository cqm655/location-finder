import type {FeatureCollection, Geometry, GeoJsonProperties} from "geojson";
import {create} from "zustand";

/** Tipurile acceptate în store */
export type GeometryKind = "AML" | "MLP";

export type StoredGeometry = {
    type: GeometryKind;   // "AML" sau "MLP"
    feature: FeatureCollection<Geometry, GeoJsonProperties>;

};

type StoreState = {
    selectedFeature: StoredGeometry | null;
    setSelectedFeature: (feature: StoredGeometry) => void;
    resetSelectedFeature: () => void;
};

export const useStoreGeometryFromCaseFolderId = create<StoreState>((set) => ({
    selectedFeature: null,
    setSelectedFeature: (feature) => set({selectedFeature: feature}),
    resetSelectedFeature: () => set({selectedFeature: null}),
}));
