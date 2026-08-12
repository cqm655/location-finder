import {useState, useCallback} from "react";
import {apiRequest} from "./api-client.ts";

export const useDownloadAudio = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const downloadAudio = useCallback(async (caseFolderId: number, index: number, fileName: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Cererea folosește apiRequest cu Axios -> Interceptorul atașează automat token-ul
            const blob = await apiRequest<Blob>(
                `audio/stream/${caseFolderId}/${index}`,
                'GET',
                undefined,
                'blob'
            );

            // Cream URL-ul temporar din blob-ul primit
            const blobUrl = window.URL.createObjectURL(blob);

            // Asigurăm extensia .mp3
            const finalFileName = fileName.endsWith(".mp3") ? fileName : `${fileName}.mp3`;

            // Creăm un element <a> invizibil pentru a declanșa salvatrea fișierului
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = finalFileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Eliberăm memoria ocupată de Blob URL
            window.URL.revokeObjectURL(blobUrl);
        } catch (err: any) {
            const errorMessage = err?.message || "Eroare la descărcarea fișierului audio";
            setError(errorMessage);
            console.error("Download error:", err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        downloadAudio,
    };
};