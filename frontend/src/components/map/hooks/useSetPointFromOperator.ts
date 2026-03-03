import * as maptilersdk from "@maptiler/sdk";
import {useEffect} from "react";
import maplibregl from "maplibre-gl";
import {useStorePointsFromCases} from "../../../store/useStorePointsFromCases.ts";
import {getSsuIconType} from "../../../utils/parse-ssu-icon.ts";
import {parseTime} from "../../../utils/parse-time.ts";

type Props = {
    map: React.RefObject<maptilersdk.Map | null>;
    markersRef: React.MutableRefObject<maplibregl.Marker[]>;
};

export const useSetPointFromOperator = ({map, markersRef}: Props) => {
    const pointFromCases = useStorePointsFromCases((state) => state.point);

    useEffect(() => {
        if (!map.current) return;

        // Curățăm markerii existenți
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        pointFromCases.forEach((point) => {
            // 1. Creăm elementul vizual
            const el = document.createElement("div");
            el.className = "custom-marker";
            const iconUrl = getSsuIconType(point.caseTypeId);

            el.style.cssText = `
                width: 32px;
                height: 32px;
                background-image: url(${iconUrl});
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                cursor: pointer;
                filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.4));
    
            `;

            // 2. Definim Popup-ul separat (fără să-l legăm prin setPopup)
            const popup = new maplibregl.Popup({
                closeButton: false, // Scoatem butonul de închidere (X)
                closeOnClick: false,
                offset: 20,
                className: 'hover-popup'
            }).setHTML(`
                <div style="padding: 4px 8px; font-family: sans-serif;">
                  
                    
                <strong style="color: #d32f2f;">Dosar: #${point.caseFolderId}</strong><br/>
                <span><strong>Creat:</strong> ${parseTime(point.created)}</span><br/>
                <span><strong>Index-1:</strong> ${point.caseIndex1Name}</span><br/>
                <span><strong>Index-2:</strong> ${point.caseIndex2Name}</span> 
                                </div>
            `);

            // 3. Adăugăm logică de Hover pe elementul DOM
            el.addEventListener('mouseenter', () => {

                // Afișăm popup-ul la coordonatele punctului
                popup.setLngLat([point.lng, point.lat]).addTo(map.current!);
            });

            el.addEventListener('mouseleave', () => {

                // Înlăturăm popup-ul când mouse-ul pleacă
                popup.remove();
            });

            // 4. Creăm markerul și îl adăugăm pe hartă
            const marker = new maplibregl.Marker({element: el})
                .setLngLat([point.lng, point.lat])
                .addTo(map.current!);

            markersRef.current.push(marker);
        });
    }, [pointFromCases, map, markersRef]);
};



