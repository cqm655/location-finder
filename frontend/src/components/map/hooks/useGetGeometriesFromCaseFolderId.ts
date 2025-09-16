import {useEffect, useState} from "react";
import {useStoreGeometryFromCaseFolderId} from "../../../store/useStoreGeometryFromCaseFolderId.ts";
import type {FeatureCollection, Geometry} from "geojson";


export const useGetGeometriesFromCaseFolderId = () => {
    const addGeometriesFromCaseFolderId = useStoreGeometryFromCaseFolderId((state) => state.selectedFeature)
    const [polygonFC, setPolygonFC] = useState<FeatureCollection<Geometry>>({type: 'FeatureCollection', features: []});
    const [pointFC, setPointFC] = useState<FeatureCollection<Geometry>>({type: 'FeatureCollection', features: []});

    useEffect(() => {
        if (!addGeometriesFromCaseFolderId) return;

        const allFeatures = addGeometriesFromCaseFolderId.feature.features;
        const polygons = allFeatures.filter(f =>
            (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon")
        );
        const points = allFeatures.filter(f => f.geometry.type === "Point");

        setPolygonFC({type: 'FeatureCollection', features: polygons});
        setPointFC({type: 'FeatureCollection', features: points});
    }, [addGeometriesFromCaseFolderId]);
    return {polygonFC, pointFC};
}