import type {FeatureCollection, Geometry, GeoJsonProperties} from "geojson";
import {create} from "zustand";

export type GeometryKind = "AML" | "MLP";

export type StoredGeometry = {
    type: GeometryKind;
    features: FeatureCollection<Geometry, GeoJsonProperties>;
};

type StoreState = {
    selectedFeature: StoredGeometry[];
    setSelectedFeature: (feature: StoredGeometry[]) => void;
    addUniqueFeature: (feature: StoredGeometry[]) => void;
    resetSelectedFeature: () => void;
    removeSelectedFeature: (feature: StoredGeometry[]) => void;

};

export const useStoreGeometryFromCaseFolderId = create<StoreState>((set) => ({
    selectedFeature: [],
    addUniqueFeature: (geom) => set((state) => {
        const current = state.selectedFeature ?? []; // dacă e null -> []
        const seen = new Set<string>();
        const uniqueItems = [...state.selectedFeature, ...geom].filter(item => {
            const key = JSON.stringify(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        return {selectedFeature: uniqueItems};
    }),

    removeSelectedFeature: (geom) => set((state) => {
        const keyToremove = JSON.stringify(geom)
        const filteredItems = state.selectedFeature?.filter(item =>
            JSON.stringify(item) !== keyToremove
        )
        return {selectedFeature: filteredItems}
    }),
    setSelectedFeature: (features) => set({selectedFeature: features}),
    resetSelectedFeature: () => set({selectedFeature: []}),
}));
