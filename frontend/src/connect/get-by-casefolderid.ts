import {useEffect, useState} from "react";
import {apiRequest} from "./api-client.ts";
import type {ApiCaseFolderIdResponse} from "./types.ts";
import {useStateCasefolderId} from "../store/useStoreGetByCasefolderId.ts";

export const useGetByCaseFolderId = () => {
    const casefolderId = useStateCasefolderId((state) => state.casefolderId);
    const setLoading = useStateCasefolderId((state) => state.setLoading);

    const [error, setError] = useState<string | null>(null);
    const [resp, setResp] = useState<ApiCaseFolderIdResponse | undefined>(undefined);

    useEffect(() => {

        if (!casefolderId) {
            setResp(undefined);
            return;
        }

        const getByCaseFolderId = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await apiRequest<ApiCaseFolderIdResponse>(
                    `folderId/${casefolderId}`,
                    'GET'
                );
                setResp(response);
            } catch (e) {
                setError(`Something went wrong while retrieving ${casefolderId}: ${e}`);
                setResp(undefined);
            } finally {
                setLoading(false);
            }
        };

        getByCaseFolderId();

    }, [casefolderId, setLoading]); // Adăugăm setLoading în dependențe dacă e din store

    return {resp, error};
};
