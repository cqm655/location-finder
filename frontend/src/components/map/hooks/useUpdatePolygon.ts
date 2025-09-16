import * as maptilersdk from "@maptiler/sdk";
import {useEffect} from "react";
import {updatePolygonData} from "../map-update-polygon.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
    points: maptilersdk.LngLat[];
}

export const useUpdatePolygon = ({map, points}: Props) => {
    useEffect(() => {
        if (map.current) updatePolygonData(map.current, points);
    }, [points]);
}