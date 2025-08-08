import {useEffect, useRef, useState} from "react";
import * as maptilersdk from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";

export const Map = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maptilersdk.Map | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [points, setPoints] = useState<maptilersdk.LngLat[]>([]);

    useEffect(() => {
        maptilersdk.config.apiKey = "34reqe0ApIH5b9TTP43k";

        if (map.current) return;

        map.current = new maptilersdk.Map({
            container: mapContainer.current!,
            style: maptilersdk.MapStyle.STREETS,
            center: [28.907089, 47.003670],
            zoom: 8,
        });

        map.current.on("load", () => {
            map.current?.addSource("polygon-source", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });

            map.current?.addLayer({
                id: "polygon-layer",
                type: "fill",
                source: "polygon-source",
                paint: {
                    "fill-color": "#088",
                    "fill-opacity": 0.3,
                },
            });

            map.current?.addLayer({
                id: "points-layer",
                type: "circle",
                source: "polygon-source",
                paint: {
                    "circle-radius": 6,
                    "circle-color": "#f00",
                },
                filter: ["==", "$type", "Point"],
            });
        });
    }, []);

    // Gestionăm click-urile pe hartă când e activ drawing
    useEffect(() => {
        if (!map.current) return;

        const handleMapClick = (e: maptilersdk.MapMouseEvent & maptilersdk.EventData) => {
            const newPoint = e.lngLat;
            setPoints((prev) => [...prev, newPoint]);
        };

        if (isDrawing) {
            map.current.on("click", handleMapClick);
        } else {
            map.current.off("click", handleMapClick);
        }

        return () => {
            if (map.current) map.current.off("click", handleMapClick);
        };
    }, [isDrawing]);

    // Actualizare GeoJSON când se schimbă punctele
    useEffect(() => {
        if (!map.current) return;

        const geojson =
            points.length < 3
                ? {
                    type: "FeatureCollection",
                    features: points.map((pt) => ({
                        type: "Feature",
                        geometry: {type: "Point", coordinates: [pt.lng, pt.lat]},
                        properties: {},
                    })),
                }
                : {
                    type: "FeatureCollection",
                    features: [
                        ...points.map((pt) => ({
                            type: "Feature",
                            geometry: {type: "Point", coordinates: [pt.lng, pt.lat]},
                            properties: {},
                        })),
                        {
                            type: "Feature",
                            geometry: {
                                type: "Polygon",
                                coordinates: [[
                                    ...points.map((pt) => [pt.lng, pt.lat]),
                                    [points[0].lng, points[0].lat], // închidem poligonul
                                ]],
                            },
                            properties: {},
                        },
                    ],
                };

        const source = map.current.getSource("polygon-source") as maptilersdk.GeoJSONSource;
        source?.setData(geojson);
    }, [points]);

    // Funcții pentru butoane
    const undoLastPoint = () => {
        setPoints((prev) => prev.slice(0, -1));
    };

    const resetPolygon = () => {
        setPoints([]);
    };

    return (
        <>
            <div
                style={{
                    position: "absolute",
                    zIndex: 10,
                    top: 10,
                    left: 10,
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={() => setIsDrawing((v) => !v)}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: isDrawing ? "red" : "green",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    {isDrawing ? "Oprește desenarea" : "Pornește desenarea"}
                </button>

                <button
                    onClick={undoLastPoint}
                    disabled={points.length === 0}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: points.length === 0 ? "gray" : "#f39c12",
                        color: "#fff",
                        border: "none",
                        cursor: points.length === 0 ? "not-allowed" : "pointer",
                    }}
                >
                    Șterge ultimul punct
                </button>

                <button
                    onClick={resetPolygon}
                    disabled={points.length === 0}
                    style={{
                        padding: "8px 12px",
                        backgroundColor: points.length === 0 ? "gray" : "#e74c3c",
                        color: "#fff",
                        border: "none",
                        cursor: points.length === 0 ? "not-allowed" : "pointer",
                    }}
                >
                    Resetează poligonul
                </button>
            </div>

            <div
                ref={mapContainer}
                style={{width: "100%", height: "100vh"}}
                className="map-container"
            />
        </>
    );
};
