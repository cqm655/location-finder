import {useState} from "react";
import {apiRequest} from "./api-client.ts";
import type {ApiLogsByCaseFolderIdResponse} from "./types.ts";

export const useGetLogsByCasefolderId = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchLogs = async (caseFolderId: number) => {
        setIsLoading(true);

        try {
            return await apiRequest<ApiLogsByCaseFolderIdResponse>(`/logs/${caseFolderId}`, 'GET')
        } catch (error) {
            setError(error as string);
            console.log(error)
        } finally {
            setIsLoading(false);
        }

    }
    return {isLoading, error, fetchLogs};
}
