import {useEffect, useRef, useState} from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {MapControls} from "./map-controls.tsx";
import {mapAddPolygon} from "./map-add-polygon.ts";
import {updatePolygonData} from "./map-update-polygon.ts";
import maplibregl from "maplibre-gl";
import {useStatePointsFromCases} from "../../store/useStatePointsFromCases.ts";

export const Map = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maptilersdk.Map | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<maptilersdk.LngLat[]>([]);
    const pointFromCases = useStatePointsFromCases((state) => state.point)
    const resetPoint = useStatePointsFromCases((state) => (state.resetPoints))

    useEffect(() => {
        maptilersdk.config.apiKey = "34reqe0ApIH5b9TTP43k";

        if (map.current) return;

        map.current = new maptilersdk.Map({
            container: mapContainer.current!,
            style: maptilersdk.MapStyle.STREETS,
            center: [28.907089, 47.00367],
            zoom: 8,
        });

        map.current.on("load", () => {
            mapAddPolygon(map.current!);
        });


    }, []);

    useEffect(() => {
        if (!map.current) return;

        const handleClick = (e: maptilersdk.MapMouseEvent & maptilersdk.EventData) => {
            setPoints((prev) => [...prev, e.lngLat]);
        };

        if (isDrawing) {
            map.current.on("click", handleClick);
        } else {
            map.current.off("click", handleClick);
        }

        return () => {
            map.current?.off("click", handleClick);
        };
    }, [isDrawing]);

    useEffect(() => {
        if (map.current) updatePolygonData(map.current, points);

    }, [points]);

    const markersRef = useRef<maplibregl.Marker[]>([]);

    useEffect(() => {
        if (!map.current) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pointFromCases.forEach((point) => {
            const el = document.createElement("div");
            el.className = "marker";
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.backgroundColor = "red";
            el.style.borderRadius = "50%";
            el.style.border = "2px solid white";

            const marker = new maplibregl.Marker(el)
                .setLngLat([point.lng, point.lat])
                .addTo(map.current!);

            markersRef.current.push(marker);
        });
    }, [pointFromCases, resetPoint]);

    const handleReset = () => {
        setPoints([])
        resetPoint()

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    }

    return (
        <div className={"map-container"} style={{display: "flex", top: 10, left: 10, gap: "8px", flexWrap: "wrap"}}>
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