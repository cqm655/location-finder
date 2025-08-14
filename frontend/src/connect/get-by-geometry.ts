import type {ApiPolygoneRequest, ApiPolygoneResponse} from "./types.ts";
import {useEffect, useState} from "react";
import {apiRequest} from "./api-client.ts";
import {useStateCasefolderId} from "../store/useStateGetByCasefolderId.ts";
import {useStatePointsFromCases} from "../store/useStatePointsFromCases.ts";

export const useGetByGeometry = (geometry: ApiPolygoneRequest) => {
    const setLoading = useStateCasefolderId((state) => state.setLoading);
    const [error, setError] = useState<string | null>(null);
    const [resp, setResp] = useState<ApiPolygoneRequest[]>();
    const setPoint = useStatePointsFromCases((state) => state.setPoint);

    useEffect(() => {
        const getByGeometry = async (geometry: ApiPolygoneRequest) => {
            setLoading(true);
            try {
                const response = await apiRequest<ApiPolygoneRequest[]>('by-area', 'POST', geometry);
                setResp(response);
                const points = response.map((item) => ({
                    lng: item.YCoordinate,
                    lat: item.XCoordinate,
                }));
                
                setPoint(points)
            } catch (e) {
                setError(`Something went wrong while retrieving data: ${e}`);
            } finally {
                setLoading(false);
            }
        }
        getByGeometry(geometry);
    }, [geometry]);
    return {resp, error}
}