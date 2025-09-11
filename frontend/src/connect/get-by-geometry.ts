import type {ApiCaseFolderIdResponse} from "./types.ts";
import {useEffect, useState} from "react";
import {apiRequest} from "./api-client.ts";
import {useStateCasefolderId} from "../store/useStateGetByCasefolderId.ts";
import {useStatePointsFromCases} from "../store/useStatePointsFromCases.ts";
import {useStateSetSideBardAccordionData} from "../store/useStateSetSideBardAccordionData.ts";


export const useGetByGeometry = (geometry: ApiCaseFolderIdResponse) => {
    const setLoading = useStateCasefolderId((state) => state.setLoading);
    const [error, setError] = useState<string | null>(null);
    const [resp, setResp] = useState<ApiCaseFolderIdResponse[]>();
    const setPoint = useStatePointsFromCases((state) => state.setPoint);
    const stateByGeometry = useStateSetSideBardAccordionData((state) => state.setCaseFolderData);

    useEffect(() => {
        const getByGeometry = async (geometry: ApiCaseFolderIdResponse) => {
            setLoading(true);
            try {
                const response = await apiRequest<ApiCaseFolderIdResponse[]>('by-area', 'POST', geometry);
                setResp(response);
                const points = response.map((item) => ({
                    lng: item.YCoordinate,
                    lat: item.XCoordinate,
                    caseIndex1Name: item.caseIndex1Name,
                    caseIndex2Name: item.caseIndex2Name,
                    caseFolderId: item.caseFolderId,
                    caseTypeId: item.caseTypeId,
                    caller: item.caller,
                    caseIndexComment: item.caseIndexComment,
                    created: item.created,
                    creator: item.creator,
                    XCoordinate: item.XCoordinate,
                    YCoordinate: item.YCoordinate,

                }));
                const safePoints: {
                    lng: number;
                    lat: number;
                    caseIndex1Name: string;
                    caseIndex2Name: string;
                    caseFolderId: number;
                    caseTypeId: number;
                    caseIndexComment: string;
                    caller: string;
                    created: Date;
                    creator: string;
                    XCoordinate: number;
                    YCoordinate: number;
                }[] = points
                    .filter(p => p.lng !== undefined && p.lat !== undefined
                    )
                    .map(p => ({
                        lng: p.lng!,
                        lat: p.lat!,
                        caseIndex1Name: p.caseIndex1Name!,
                        caseIndex2Name: p.caseIndex2Name!,
                        caseFolderId: p.caseFolderId!,
                        caseTypeId: p.caseTypeId!,
                        caseIndexComment: p.caseIndexComment!,
                        caller: p.caller!,
                        created: p.created!,
                        creator: p.creator!,
                        XCoordinate: p.XCoordinate!,
                        YCoordinate: p.YCoordinate!,
                    }));
                stateByGeometry(safePoints)
                setPoint(safePoints)
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