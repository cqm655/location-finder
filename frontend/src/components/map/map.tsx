import {useRef, useState} from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {MapControls} from "./map-controls.tsx";
import maplibregl from "maplibre-gl";
import {useStateSetSideBardAccordionData} from "../../store/useStateSetSideBardAccordionData.ts";
import {useSelectCasesOnMap} from "./hooks/useSelectCasesOnMap.ts";
import {useSetPointFromOperator} from "./hooks/useSetPointFromOperator.ts";
import {useInitMap} from "./hooks/useInitMap.ts";
import {useUpdatePolygon} from "./hooks/useUpdatePolygon.ts";
import {useAddPointOnMap} from "./hooks/useAddPointOnMap.ts";
import {useGetGeometriesFromCaseFolderId} from "./hooks/useGetGeometriesFromCaseFolderId.ts";
import {useDrawPolygonFromCaseFolderId} from "./hooks/useDrawPolygonFromCaseFolderId.ts";
import {useDrawPointFromCaseFolderID} from "./hooks/useDrawPointFromCaseFolderID.ts";

export const Map = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maptilersdk.Map | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<maptilersdk.LngLat[]>([]);
    const resetAccordionData = useStateSetSideBardAccordionData((state) => state.resetCaseFolderData)
    const {polygonFC, pointFC} = useGetGeometriesFromCaseFolderId()

    const markersRef = useRef<maplibregl.Marker[]>([]);

    useInitMap({map, mapContainer})

    useSelectCasesOnMap({map, isDrawing, setPoints})

    useUpdatePolygon({map, points})

    useSetPointFromOperator({map})

    useAddPointOnMap({map})

    useDrawPolygonFromCaseFolderId({map, polygonFC})

    useDrawPointFromCaseFolderID({map, pointFC})

    const handleReset = () => {
        setPoints([])
        resetPoint()
        resetAccordionData()
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    }

    return (
        <div className={"hooks-container"} style={{display: "flex", top: 10, left: 10, gap: "8px", flexWrap: "wrap"}}>
            <MapControls
                isDrawing={isDrawing}
                pointsCount={points.length}
                onToggleDrawing={() => setIsDrawing((v) => !v)}
                onUndo={() => setPoints((prev) => prev.slice(0, -1))}
                onReset={handleReset}
            />

            <div ref={mapContainer} style={{width: "100%", height: "100vh", position: "absolute"}}/>
        </div>
    );
};