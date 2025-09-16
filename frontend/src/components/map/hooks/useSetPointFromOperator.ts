import * as maptilersdk from "@maptiler/sdk";
import {useEffect, useRef} from "react";
import maplibregl from "maplibre-gl";
import {useStatePointsFromCases} from "../../../store/useStatePointsFromCases.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
}

export const useSetPointFromOperator = ({map}: Props) => {
    const pointFromCases = useStatePointsFromCases((state) => state.point)
    const resetPoint = useStatePointsFromCases((state) => (state.resetPoints))

    const markersRef = useRef<maplibregl.Marker[]>([]);

    useEffect(() => {
        if (!map.current) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pointFromCases.forEach((point) => {
            const el = document.createElement("div");
            el.className = "marker";
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.backgroundColor = "red";
            el.style.borderRadius = "50%";
            el.style.border = "2px solid white";

            const marker = new maplibregl.Marker(el)
                .setLngLat([point.lng, point.lat])
                .setPopup(new maplibregl.Popup().setText(`CaseFolderId: ${point.caseFolderId} \n CaseTypeId: ${point.caseTypeId} \n CaseIndex1Name: ${point.caseIndex1Name}\n`))
                .addTo(map.current!);


            markersRef.current.push(marker);
        });
    }, [pointFromCases, resetPoint]);

}