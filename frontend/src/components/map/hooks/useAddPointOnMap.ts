import {useEffect} from "react";
import * as maptilersdk from "@maptiler/sdk";
import maplibregl from "maplibre-gl";
import {useStoreAddPointOnMap} from "../../../store/useStoreAddPointOnMap.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
    markersRef: React.RefObject<maplibregl.Marker[]>;
}

export const useAddPointOnMap = ({map, markersRef}: Props) => {
    const addPointOnMap = useStoreAddPointOnMap((state) => state.coordinates)

    useEffect(() => {
        if (!map.current) return;
        if (!addPointOnMap) return;
        const {XCoordinate, YCoordinate} = addPointOnMap;
        if (XCoordinate === 0 && YCoordinate === 0) return;

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