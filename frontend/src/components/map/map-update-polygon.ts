import * as maptilersdk from "@maptiler/sdk";
import {useStoreGeometry} from "../../store/useStoreGeometry.ts";

export const updatePolygonData = (
    map: maptilersdk.Map,
    points: maptilersdk.LngLat[]
) => {
    const setGeometry = useStoreGeometry.getState().setGeometry;

    const geometryForBackend = {
        latitude: points.map(pt => pt.lat),
        longitude: points.map(pt => pt.lng)
    };
    setGeometry(geometryForBackend);
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
                                [points[0].lng, points[0].lat],
                            ]],
                        },
                        properties: {},
                    },
                ],
            };

    const source = map.getSource("polygon-source") as maptilersdk.GeoJSONSource;
    source?.setData(geojson);
};
