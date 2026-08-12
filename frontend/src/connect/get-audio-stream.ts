import {useState, useMemo, useCallback, useEffect} from "react";
import {parseAudioFileName} from "../utils/parse-audio-name.ts";
import {apiRequest} from "./api-client.ts";
import {useDownloadAudio} from "./download-audio.ts";

interface AudioFile {
    FileName?: string;
    OperatorName?: string;
}

export const useAudioStream = (
    caseFolderId: number,
    file: AudioFile,
    index: number
) => {
    const [isStreamLoading, setIsStreamLoading] = useState(false);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

    // Integrăm hook-ul de descărcare
    const {
        isLoading: isDownloadLoading,
        error: downloadError,
        downloadAudio
    } = useDownloadAudio();

    // 1. Numele fișierului
    const fileName = useMemo(() => {
        return file?.FileName || file?.OperatorName || `Inregistrare_${caseFolderId}_${index + 1}`;
    }, [file, caseFolderId, index]);

    // 2. Eticheta formatată
    const formattedLabel = useMemo(() => {
        const parsed = parseAudioFileName(fileName || "");
        return parsed
            ? `${parsed.date} ${parsed.time} — ${parsed.operator} (${parsed.workstation})`
            : fileName;
    }, [fileName]);

    // 3. Preluarea Blob-ului pentru Play via apiRequest
    const loadAudioBlob = useCallback(async (): Promise<string> => {
        if (audioBlobUrl) return audioBlobUrl;

        setIsStreamLoading(true);
        setStreamError(null);

        try {
            const blob = await apiRequest<Blob>(
                `audio/stream/${caseFolderId}/${index}`,
                'GET',
                undefined,
                'blob'
            );

            const objectUrl = URL.createObjectURL(blob);
            setAudioBlobUrl(objectUrl);
            return objectUrl;
        } catch (err: any) {
            const errorMessage = err?.message || "Eroare la încărcarea audio";
            setStreamError(errorMessage);
            console.error("Audio stream error:", err);
            throw err;
        } finally {
            setIsStreamLoading(false);
        }
    }, [audioBlobUrl, caseFolderId, index]);

    // 4. Action Wrapper pentru descărcare
    const handleDownload = useCallback(() => {
        return downloadAudio(caseFolderId, index, fileName);
    }, [downloadAudio, caseFolderId, index, fileName]);

    // Curățare Blob la unmount
    useEffect(() => {
        return () => {
            if (audioBlobUrl) {
                URL.revokeObjectURL(audioBlobUrl);
            }
        };
    }, [audioBlobUrl]);

    return {
        isLoading: isStreamLoading || isDownloadLoading,
        isDownloadLoading,
        error: streamError || downloadError,
        audioBlobUrl,
        fileName,
        formattedLabel,
        loadAudioBlob,
        handleDownload,
    };
};