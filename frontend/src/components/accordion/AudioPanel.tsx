import type {SyntheticEvent} from "react";
import {Button, Paper, Stack, Typography} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import {useGetSoundFiles} from "../../connect/get-sound-files.ts";
import {AudioPlayerItem} from "../audio-player/audio-player.tsx";
import {useLazyFetch} from "../../hooks/useLazyFetch.ts";

interface AudioFile {
    FileName?: string;
    OperatorName?: string;
}

// Un singur <audio> cântă la un moment dat, între toate cazurile din listă.
// Variabila e la nivel de modul, ca să fie comună tuturor panourilor.
let currentlyPlaying: HTMLAudioElement | null = null;

const handlePlay = (e: SyntheticEvent<HTMLAudioElement>) => {
    const el = e.currentTarget;
    if (currentlyPlaying && currentlyPlaying !== el) currentlyPlaying.pause();
    currentlyPlaying = el;
};

export const AudioPanel = ({caseFolderId}: { caseFolderId: number }) => {
    const {fetchSoundFiles} = useGetSoundFiles();
    const audio = useLazyFetch<AudioFile>();

    const handleLoad = () =>
        audio.load(async () => {
            const resp = await fetchSoundFiles(caseFolderId);
            return Array.isArray(resp) ? resp : [];
        });

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 2,
                bgcolor: "#f0f4f8",
                minHeight: "50px",
                maxHeight: "300px",
                overflow: audio.data ? "auto" : "hidden",
                transition: "min-height 0.2s ease",
            }}
        >
            <Typography variant="subtitle2" gutterBottom sx={{display: "flex", alignItems: "center", gap: 1}}>
                <HistoryIcon fontSize="small" color="secondary"/> Înregistrări Apel
            </Typography>

            {audio.error && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
                    <Typography variant="caption" color="error">{audio.error}</Typography>
                    <Button size="small" onClick={handleLoad}>Reîncearcă</Button>
                </Stack>
            )}

            {!audio.data ? (
                <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={handleLoad}
                    disabled={audio.loading}
                >
                    {audio.loading ? "Se încarcă..." : "Încarcă Înregistrări"}
                </Button>
            ) : (
                <Stack spacing={1}>
                    {audio.data.length > 0 ? (
                        audio.data.map((file, index) => (
                            <AudioPlayerItem
                                key={`${caseFolderId}-audio-${index}`}
                                caseFolderId={caseFolderId}
                                file={file}
                                index={index}
                                onGlobalPlay={handlePlay}
                            />
                        ))
                    ) : (
                        <Typography variant="caption" color="text.secondary">
                            Nu s-au găsit înregistrări.
                        </Typography>
                    )}
                </Stack>
            )}
        </Paper>
    );
};