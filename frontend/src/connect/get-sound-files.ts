import {useState, useCallback} from "react";
import {apiRequest} from "./api-client.ts";

export const useGetSoundFiles = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSoundFiles = useCallback(async (caseFolderId: number) => {
        setIsLoading(true);
        setError(null);

        try {
            return await apiRequest(`audio/list/${caseFolderId}`, 'GET');
        } catch (err: any) {
            const errorMessage = err?.message || "Eroare la încărcarea fișierelor audio";
            setError(errorMessage);
            console.error("Audio fetch error:", err);
            throw err; // Aruncăm eroarea pentru ca apelantul (ex: cache/loader) să o pot prinde
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {isLoading, error, fetchSoundFiles};
};