import * as maptilersdk from "@maptiler/sdk";
import {useEffect} from "react";
import maplibregl from "maplibre-gl";
import {useStorePointsFromCases} from "../../../store/useStorePointsFromCases.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
    markersRef: React.MutableRefObject<maplibregl.Marker[]>;
};

export const useSetPointFromOperator = ({map, markersRef}: Props) => {
    const pointFromCases = useStorePointsFromCases((state) => state.point);

    useEffect(() => {
        if (!map.current) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pointFromCases.forEach((point) => {
            const el = document.createElement("div");
            el.className = "marker";
            el.style.cssText = `
                width:20px;
                height:20px;
                background:red;
                border-radius:50%;
                border:2px solid white;
            `;

            const marker = new maplibregl.Marker(el)
                .setLngLat([point.lng, point.lat])
                .setPopup(new maplibregl.Popup().setText(
                    `CaseFolderId: ${point.caseFolderId}\nCaseTypeId: ${point.caseTypeId}`
                ))
                .addTo(map.current!);

            markersRef.current.push(marker);
        });
    }, [pointFromCases]);
};
