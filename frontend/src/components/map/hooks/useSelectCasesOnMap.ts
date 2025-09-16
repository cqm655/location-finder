import {useEffect} from "react";
import * as maptilersdk from "@maptiler/sdk";

type UseDrawPolygonArgs = {
    map: React.RefObject<maptilersdk.Map | null>;
    isDrawing: boolean;
    setPoints: React.Dispatch<React.SetStateAction<maptilersdk.LngLat[]>>;
};

export function useSelectCasesOnMap({map, isDrawing, setPoints}: UseDrawPolygonArgs) {

    useEffect(() => {
        if (!map?.current) return;

        const mapInstance = map?.current

        const handleClick = (e: maptilersdk.MapMouseEvent & maptilersdk.EventData) => {
            setPoints(prev => [...prev, e.lngLat]);
        };

        if (isDrawing) {
            mapInstance.on("click", handleClick);
        } else {
            mapInstance.off("click", handleClick);
        }

        return () => {
            mapInstance.off("click", handleClick);
        };
    }, [isDrawing]);
}
