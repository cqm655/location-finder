import * as maptilersdk from "@maptiler/sdk";
import {points} from "@turf/turf"; // Redenumește pentru claritate

export const mapAddPolygon = (map: maptilersdk.Map) => {
    map.addSource("polygon-source", {
        type: "geojson",
        data: {type: "FeatureCollection", features: points},
    });

    map.addLayer({
        id: "polygon-layer",
        type: "fill",
        source: "polygon-source",
        paint: {"fill-color": "#088", "fill-opacity": 0.3},
    });

    map.addLayer({
        id: "points-layer",
        type: "circle",
        source: "polygon-source",
        paint: {"circle-radius": 4, "circle-color": "#f00"},
        filter: ["==", "$type", "Point"],
    });
};
