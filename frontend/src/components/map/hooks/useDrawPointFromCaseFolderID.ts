import {useEffect} from "react";
import * as maptilersdk from "@maptiler/sdk";

type  Props = {
    map: React.RefObject<maptilersdk.Map | null>,
    pointFC: { type: 'FeatureCollection', features: points }
}

export const useDrawPointFromCaseFolderID = ({map, pointFC}: Props) => {
    useEffect(() => {
        if (!map.current) return;
        if (!pointFC.features.length) return;

        // dacă sursa există, doar o actualizăm
        if (map.current.getSource("points")) {
            (map.current.getSource("points") as maptilersdk.GeoJSONSource).setData(pointFC);
        } else {
            map.current.addSource("points", {
                type: "geojson",
                data: pointFC,
            });

            // layer de tip circle
            map.current.addLayer({
                id: "points-circle",
                type: "circle",
                source: "points",
                paint: {
                    "circle-radius": 8,
                    "circle-color": "#ff0000",
                    "circle-stroke-width": 2,
                    "circle-stroke-color": "#ffffff",
                },
            });
        }

        const [lng, lat] = pointFC.features[0].geometry.coordinates as [number, number];
        map.current.flyTo({center: [lng, lat], zoom: 18});
    }, [pointFC]);
}