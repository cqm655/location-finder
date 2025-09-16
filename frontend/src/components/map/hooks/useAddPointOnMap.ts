import {useEffect, useRef} from "react";
import * as maptilersdk from "@maptiler/sdk";
import maplibregl from "maplibre-gl";
import {useStoreAddPointOnMap} from "../../../store/useStoreAddPointOnMap.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
}

export const useAddPointOnMap = ({map}: Props) => {
    const addPointOnMap = useStoreAddPointOnMap((state) => state.coordinates)
    const markersRef = useRef<maplibregl.Marker[]>([]);
    useEffect(() => {
        if (!map.current) return;
        if (!addPointOnMap) return;
        const {XCoordinate, YCoordinate} = addPointOnMap;
        if (XCoordinate === 0 && YCoordinate === 0) return;
        console.log(XCoordinate)

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const marker = new maptilersdk.Marker({
            color: "#ffa500",

        }).setLngLat([YCoordinate, XCoordinate])
            .setPopup(new maplibregl.Popup().setText('test'))
            .addTo(map.current);

        markersRef.current.push(marker);

        map.current.flyTo({center: [YCoordinate, XCoordinate], zoom: 18});
    }, [addPointOnMap]);
}