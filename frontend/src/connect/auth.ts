import {useState} from "react";
import type {UserCredentials} from "./types.ts";
import {apiRequest} from "./api-client.ts";

export const useAuth = () => {
    const [isLoading, setIsloading] = useState(false);
    const [isError, setIsError] = useState<Error | null>(null);

    const fetchUser = async (user: any) => {
        setIsloading(true);
        try {
            const response = await apiRequest<UserCredentials>(`/auth/login`, 'POST', user);
            sessionStorage.setItem("access_token", response.access_token);
        } catch (error) {
            setIsError(error as Error);
            console.log(error);
        } finally {
            setIsloading(false);

        }


    }
    return {isLoading, isError, fetchUser};
}