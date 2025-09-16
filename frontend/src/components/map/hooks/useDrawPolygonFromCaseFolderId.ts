import {useEffect} from "react";
import * as maptilersdk from "@maptiler/sdk";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
    polygonFC: { type: 'FeatureCollection', features: polygons }
}

export const useDrawPolygonFromCaseFolderId = ({map, polygonFC}: Props) => {
    useEffect(() => {
        if (!map.current || !polygonFC.features.length) return;

        if (map.current.getSource("polygon")) {
            (map.current.getSource("polygon") as maptilersdk.GeoJSONSource).setData(polygonFC);
        } else {
            map.current.addSource("polygon", {type: "geojson", data: polygonFC});
            map.current.addLayer({
                id: "polygon-fill",
                type: "fill",
                source: "polygon",
                paint: {"fill-color": "#ff0000", "fill-opacity": 0.3}
            });
            map.current.addLayer({
                id: "polygon-outline",
                type: "line",
                source: "polygon",
                paint: {"line-color": "#ff0000", "line-width": 2}
            });
        }

        // zoom pe toate poligoanele
        const bounds = new maptilersdk.LngLatBounds();
        polygonFC.features.forEach(f => {
            const rings = f.geometry.type === "Polygon"
                ? f.geometry.coordinates
                : f.geometry.coordinates.flat();
            rings.forEach(r => r.forEach(([lng, lat]) => bounds.extend([lng, lat])));
        });
        map.current.fitBounds(bounds, {padding: 40});
    }, [polygonFC]);
}