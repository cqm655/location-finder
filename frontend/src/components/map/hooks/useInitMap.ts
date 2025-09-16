import {useEffect, useRef} from "react";
import * as maptilersdk from "@maptiler/sdk";
import {mapAddPolygon} from "../map-add-polygon.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
    mapContainer: useRef<HTMLDivElement | null>;
}

export const useInitMap = ({map, mapContainer}: Props) => {

    useEffect(() => {
        maptilersdk.config.apiKey = "34reqe0ApIH5b9TTP43k";

        if (map.current) return;

        map.current = new maptilersdk.Map({
            container: mapContainer.current!,
            style: maptilersdk.MapStyle.OPENSTREETMAP,
            center: [28.907089, 47.00367],
            zoom: 8,
        });

        map.current.on("load", () => {
            mapAddPolygon(map.current!);
        });


    }, []);
}