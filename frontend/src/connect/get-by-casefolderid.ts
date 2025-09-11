import {useEffect, useState} from "react";
import {apiRequest} from "./api-client.ts";
import type {ApiCaseFolderIdResponse} from "./types.ts";
import {useStateCasefolderId} from "../store/useStateGetByCasefolderId.ts";

export const useGetByCaseFolderId = () => {

    const casefolderId = useStateCasefolderId((state) => state.casefolderId);
    const setLoading = useStateCasefolderId((state) => state.setLoading);
    const [error, setError] = useState<string | null>(null);
    const [resp, setResp] = useState<ApiCaseFolderIdResponse>();


    useEffect(() => {
        const getByCaseFolderId = async () => {
            setLoading(true);
            try {
                const response = await apiRequest<ApiCaseFolderIdResponse>(`folderId/${casefolderId}`, 'GET')
                setResp(response)

            } catch (e) {
                setError(`Something went wrong while retrieving ${casefolderId}, ${e}`)
            } finally {
                setLoading(false);
            }
        }
        getByCaseFolderId()
    }, [casefolderId])
    return {resp, error}
}