import {useRef, useState} from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {MapControls} from "./map-controls.tsx";
import maplibregl from "maplibre-gl";
import {useStoreSetSideBardAccordionData} from "../../store/useStoreSetSideBardAccordionData.ts";
import {useSelectCasesOnMap} from "./hooks/useSelectCasesOnMap.ts";
import {useSetPointFromOperator} from "./hooks/useSetPointFromOperator.ts";
import {useInitMap} from "./hooks/useInitMap.ts";
import {useUpdatePolygon} from "./hooks/useUpdatePolygon.ts";
import {useAddPointOnMap} from "./hooks/useAddPointOnMap.ts";
import {useGetGeometriesFromCaseFolderId} from "./hooks/useGetGeometriesFromCaseFolderId.ts";
import {useDrawPolygonFromCaseFolderId} from "./hooks/useDrawPolygonFromCaseFolderId.ts";
import {useDrawPointFromCaseFolderID} from "./hooks/useDrawPointFromCaseFolderID.ts";
import {useStorePointsFromCases} from "../../store/useStorePointsFromCases.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import {useStoreGeometry} from "../../store/useStoreGeometry.ts";

export const Map = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maptilersdk.Map | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<maptilersdk.LngLat[]>([]);
    const {polygonFC, pointFC} = useGetGeometriesFromCaseFolderId()
    const resetAccordionData = useStoreSetSideBardAccordionData((state) => state.resetCaseFolderData)
    const resetPoint = useStorePointsFromCases((state) => state.resetPoints)
    const removeStoreGeometry = useStoreGeometry((state) => state.removeGeometry)
    const removeUniqueGeometrie = useStoreGeometryFromCaseFolderId((state) => state.removeSelectedFeature)
    const uniqueSelectedGeometries = useStoreGeometryFromCaseFolderId((state) => state.selectedFeature)
    const markersRef = useRef<maplibregl.Marker[]>([]);

    useInitMap({map, mapContainer})

    useSelectCasesOnMap({map, isDrawing, setPoints})

    useUpdatePolygon({map, points})

    useSetPointFromOperator({map, markersRef})

    useAddPointOnMap({map, markersRef})

    useDrawPolygonFromCaseFolderId({map, polygonFC})

    useDrawPointFromCaseFolderID({map, pointFC})

    const handleReset = () => {
        setPoints([])
        resetPoint()
        removeUniqueGeometrie(uniqueSelectedGeometries)
        resetAccordionData()
        removeStoreGeometry()

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        if (map.current) {
            const layersToRemove = ["polygon-fill", "points-circle", "polygon-outline"]; // folosește id-urile layer-elor tale
            layersToRemove.forEach(layerId => {
                if (map.current.getLayer(layerId)) {
                    map.current.removeLayer(layerId);
                }
                if (map.current.getSource(layerId)) {
                    map.current.removeSource(layerId);
                }
            });


        }
        map.current.flyTo({
            center: [28.907089, 47.00367],
            zoom: 8
        });
    }

    const handleSearch = () => {
        // logica ta de search / activare drawing
        setIsDrawing(true); // sau ce vrei să se întâmple
    }

    return (
        <div className={"hooks-container"} style={{display: "flex", top: 10, left: 10, gap: "8px", flexWrap: "wrap"}}>
            <MapControls
                isDrawing={isDrawing}
                pointsCount={points.length}
                onToggleDrawing={() => setIsDrawing((v) => !v)}
                onUndo={() => setPoints((prev) => prev.slice(0, -1))}
                onReset={() => handleReset()}
                onSearch={handleSearch}
            />

            <div ref={mapContainer} style={{width: "100%", height: "100vh", position: "absolute"}}/>
        </div>
    );
};
