import {useState} from "react";
import {apiRequest} from "./api-client.ts";
import type {ResponseGeomByCaseFolderId} from "./types.ts";

export const useGetGeomByCasefolderid = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    const fetchGeom = async (caseFolderId: number) => {
        setIsLoading(true);

        try {
            return await apiRequest<ResponseGeomByCaseFolderId[]>(`/geometry/${caseFolderId}`, 'GET');
        } catch (error) {
            setError(error as string)
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    }


    return {isLoading, error, fetchGeom};
}
