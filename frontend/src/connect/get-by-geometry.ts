import type {ApiCaseFolderIdResponse} from "./types.ts";
import {useState} from "react";
import {apiRequest} from "./api-client.ts";
import {useStateCasefolderId} from "../store/useStoreGetByCasefolderId.ts";
import {useStorePointsFromCases} from "../store/useStorePointsFromCases.ts";
import {useStoreSetSideBardAccordionData} from "../store/useStoreSetSideBardAccordionData.ts";


export const useGetByGeometry = () => {
    const setLoading = useStateCasefolderId((state) => state.setLoading);
    const [error, setError] = useState<string | null>(null);
    const [resp, setResp] = useState<ApiCaseFolderIdResponse[]>();

    const setPoint = useStorePointsFromCases((state) => state.setPoint);
    const stateByGeometry = useStoreSetSideBardAccordionData((state) => state.setCaseFolderData);

    const fetchData = async (payload: ApiCaseFolderIdResponse) => {
        // Evităm request-uri dacă geometria este goală
        if (!payload.geometry || (payload.geometry as any).features?.length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiRequest<ApiCaseFolderIdResponse[]>('by-area', 'POST', payload);
            setResp(response);

            // Mapare sigură și filtrare
            const safePoints = response
                .filter(item => item.XCoordinate !== undefined && item.YCoordinate !== undefined)
                .map(item => ({
                    lng: item.YCoordinate!, // MapLibre vrea [lng, lat] adică [Y, X] de obicei
                    lat: item.XCoordinate!,
                    caseIndex1Name: item.caseIndex1Name || "",
                    caseIndex2Name: item.caseIndex2Name || "",
                    caseFolderId: item.caseFolderId!,
                    caseTypeId: item.caseTypeId || 0,
                    phoneNumber: item.phoneNumber || '',
                    caseTypeName: item.caseTypeName || "",
                    caseIndexComment: item.caseIndexComment || "",
                    caller: item.caller || "",
                    created: item.created ? new Date(item.created) : new Date(),
                    creator: item.creator || "",
                    XCoordinate: item.XCoordinate!,
                    YCoordinate: item.YCoordinate!,
                }));

            // Actualizăm Store-urile globale
            stateByGeometry(safePoints);
            setPoint(safePoints);

        } catch (e) {
            setError(`Something went wrong: ${e}`);
        } finally {
            setLoading(false);
        }
    };

    // Returnăm funcția de trigger, nu mai rulăm useEffect
    return {fetchData, resp, error};
};
