import {useEffect, useRef, useState} from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {MapControls} from "./map-controls.tsx";
import {mapAddPolygon} from "./map-add-polygon.ts";
import {updatePolygonData} from "./map-update-polygon.ts";
import maplibregl from "maplibre-gl";
import {useStatePointsFromCases} from "../../store/useStatePointsFromCases.ts";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import {useStateSetSideBardAccordionData} from "../../store/useStateSetSideBardAccordionData.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import type {FeatureCollection, Geometry} from "geojson";

export const Map = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maptilersdk.Map | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<maptilersdk.LngLat[]>([]);
    const pointFromCases = useStatePointsFromCases((state) => state.point)
    const resetPoint = useStatePointsFromCases((state) => (state.resetPoints))
    const addPointOnMap = useStoreAddPointOnMap((state) => state.coordinates)
    const resetAccordionData = useStateSetSideBardAccordionData((state) => state.resetCaseFolderData)
    const addGeometriesFromCaseFolderId = useStoreGeometryFromCaseFolderId((state) => state.selectedFeature)


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
                .setPopup(new maplibregl.Popup().setText(`CaseFolderId: ${point.caseFolderId} \n CaseTypeId: ${point.caseTypeId} \n CaseIndex1Name: ${point.caseIndex1Name}\n`))
                .addTo(map.current!);


            markersRef.current.push(marker);
        });
    }, [pointFromCases, resetPoint]);

    const handleReset = () => {
        setPoints([])
        resetPoint()
        resetAccordionData()
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
    }
    useEffect(() => {
        if (!map.current) return;
        if (!addPointOnMap) return;
        const {XCoordinate, YCoordinate} = addPointOnMap;
        if (XCoordinate === 0 && YCoordinate === 0) return;
        console.log(XCoordinate)

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const el = document.createElement("div");
        el.className = "marker";
        el.style.width = "20px";
        el.style.height = "20px";
        el.style.backgroundColor = "red";
        el.style.borderRadius = "50%";
        el.style.border = "2px solid white";

        const marker = new maplibregl.Marker(el)
            .setLngLat([YCoordinate, XCoordinate])
            .setPopup(new maplibregl.Popup().setHTML("<b>Punct selectat</b><br/>Coordonate"))
            .addTo(map.current!);

        markersRef.current.push(marker);

        map.current.flyTo({center: [YCoordinate, XCoordinate], zoom: 14});
    }, [addPointOnMap]);

    useEffect(() => {
        if (!map.current || !addGeometriesFromCaseFolderId) return;

        const allFeatures = addGeometriesFromCaseFolderId.feature.features;

        // Poligoane
        const polygonFeatures = allFeatures.filter(
            f => (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") &&
                f.geometry.coordinates.some(ring => ring.length > 0) // verificăm coordonate
        );

        // Puncte
        const pointFeatures = allFeatures.filter(
            f => f.geometry.type === "Point" &&
                Array.isArray(f.geometry.coordinates) &&
                f.geometry.coordinates.length === 2 // coordonate valide
        );

        const polygonFC: FeatureCollection<Geometry> = {
            type: "FeatureCollection",
            features: polygonFeatures
        };

        const pointFC: FeatureCollection<Geometry> = {
            type: "FeatureCollection",
            features: pointFeatures
        };

        // --- Poligoane ---
        if (map.current.getSource("polygon")) {
            (map.current.getSource("polygon") as maptilersdk.GeoJSONSource).setData(polygonFC);
        } else {
            map.current.addSource("polygon", {type: "geojson", data: polygonFC});
            map.current.addLayer({
                id: "polygon-fill",
                type: "fill",
                source: "polygon",
                paint: {"fill-color": "#ff0000", "fill-opacity": 0.3},
            });
            map.current.addLayer({
                id: "polygon-outline",
                type: "line",
                source: "polygon",
                paint: {"line-color": "#ff0000", "line-width": 2},
            });
        }

        // --- Puncte ---
        if (pointFeatures.length) {
            if (map.current.getSource("points")) {
                (map.current.getSource("points") as maptilersdk.GeoJSONSource).setData(pointFC);
            } else {
                map.current.addSource("points", {type: "geojson", data: pointFC});
                map.current.addLayer({
                    id: "points-layer",
                    type: "circle",
                    source: "points",
                    paint: {
                        "circle-radius": 10,
                        "circle-color": "#0000ff",
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#ffffff"
                    }
                });
            }

            // Zoom pe primul punct valid
            const firstPoint = pointFeatures.find(p => Array.isArray(p.geometry.coordinates) && p.geometry.coordinates.length === 2);
            if (firstPoint) {
                const [lng, lat] = firstPoint.geometry.coordinates as [number, number];
                map.current.flyTo({center: [lng, lat], zoom: 15});
            }
        } else if (polygonFeatures.length) {
            // Zoom pe poligoane doar dacă există coordonate valide
            const bounds = new maptilersdk.LngLatBounds();
            let hasCoords = false;

            polygonFeatures.forEach(f => {
                const coords = f.geometry.type === "Polygon" ? f.geometry.coordinates : f.geometry.coordinates.flat();
                coords.forEach(ring => {
                    if (ring.length > 0) {
                        hasCoords = true;
                        ring.forEach(([lng, lat]) => bounds.extend([lng, lat]));
                    }
                });
            });

            if (hasCoords) {
                map.current.fitBounds(bounds, {padding: 50});
            }
        }

    }, [addGeometriesFromCaseFolderId]);


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