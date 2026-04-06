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
        // 1. Verificăm dacă avem un ID valid înainte de a face request-ul
        if (!casefolderId) {
            setResp(undefined); // Resetăm răspunsul anterior dacă ID-ul dispare
            return;
        }

        const getByCaseFolderId = async () => {
            setLoading(true);
            setError(null); // Resetăm eroarea la fiecare request nou

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
