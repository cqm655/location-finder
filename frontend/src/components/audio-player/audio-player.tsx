import React from "react";
import {Box, Typography, Stack, IconButton, CircularProgress, Button} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {useAudioStream} from "../../connect/get-audio-stream.ts";

interface AudioPlayerItemProps {
    caseFolderId: number;
    file: { FileName?: string; OperatorName?: string };
    index: number;
    onGlobalPlay?: (e: React.SyntheticEvent<HTMLAudioElement>) => void;
}

export const AudioPlayerItem: React.FC<AudioPlayerItemProps> = ({
                                                                    caseFolderId,
                                                                    file,
                                                                    index,
                                                                    onGlobalPlay
                                                                }) => {
    const {
        isLoading,
        isDownloadLoading,
        error,
        audioBlobUrl,
        formattedLabel,
        fileName,
        loadAudioBlob,
        handleDownload
    } = useAudioStream(caseFolderId, file, index);

    return (
        <Box sx={{mb: 2}}>
            <Typography variant="caption" sx={{display: "block", mb: 0.5, fontWeight: 450}}>
                {formattedLabel}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} sx={{width: "340px"}}>
                {!audioBlobUrl ? (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={isLoading && !isDownloadLoading ? <CircularProgress size={14}/> : <PlayArrowIcon/>}
                        disabled={isLoading}
                        onClick={loadAudioBlob}
                        sx={{height: "35px", flexGrow: 1, textTransform: "none"}}
                    >
                        {isLoading && !isDownloadLoading ? "Se încarcă..." : "Apasă pentru ascultare"}
                    </Button>
                ) : (
                    <audio
                        controls
                        autoPlay
                        src={audioBlobUrl}
                        style={{
                            width: "100%",
                            minWidth: "100%",
                            height: "35px",
                            flexGrow: 1,
                        }}
                        onPlay={onGlobalPlay}
                    />
                )}

                <IconButton
                    size="small"
                    disabled={isLoading}
                    aria-label={`Descarcă înregistrarea ${fileName}`}
                    onClick={handleDownload}
                    sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        flexShrink: 0,
                        "&:hover": {bgcolor: "primary.dark"},
                    }}
                >
                    {isDownloadLoading ? (
                        <CircularProgress size={18} color="inherit"/>
                    ) : (
                        <DownloadIcon fontSize="small"/>
                    )}
                </IconButton>
            </Stack>

            {error && (
                <Typography variant="caption" color="error" sx={{display: "block", mt: 0.5}}>
                    {error}
                </Typography>
            )}
        </Box>
    );
};