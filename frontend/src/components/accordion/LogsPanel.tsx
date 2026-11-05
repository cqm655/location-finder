import {Box, Button, Paper, Stack, Typography} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import {useGetLogsByCasefolderId} from "../../connect/get-logs-by-casefolderid.ts";
import {useLazyFetch} from "../../hooks/useLazyFetch.ts";

interface LogEntry {
    Created: string;
    LogText: string;
}

export const LogsPanel = ({caseFolderId}: { caseFolderId: number }) => {
    const {fetchLogs} = useGetLogsByCasefolderId();
    const logs = useLazyFetch<LogEntry>();

    const handleLoad = () =>
        logs.load(async () => {
            const resp = await fetchLogs(caseFolderId);
            return Array.isArray(resp) ? resp : [];
        });

    return (
        <Paper variant="outlined" sx={{p: 1, bgcolor: "#f8f9fa"}}>
            <Typography variant="subtitle2" sx={{display: "flex", alignItems: "center", gap: 1}}>
                <ArticleIcon fontSize="small" color="action"/> Loguri Activitate
            </Typography>

            {!logs.data && (
                <Button
                    fullWidth
                    variant="contained"
                    color="inherit"
                    onClick={handleLoad}
                    disabled={logs.loading}
                    sx={{mt: 1}}
                >
                    {logs.loading ? "Se încarcă..." : "Vezi Loguri"}
                </Button>
            )}

            {logs.error && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1}}>
                    <Typography variant="caption" color="error">{logs.error}</Typography>
                    <Button size="small" onClick={handleLoad}>Reîncearcă</Button>
                </Stack>
            )}

            {logs.data && (
                <Box
                    sx={{
                        mt: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        maxHeight: 250,
                        overflowY: "auto",
                        bgcolor: "#1e1e1e",
                        p: 1,
                        borderRadius: 1,
                        fontFamily: "monospace",
                    }}
                >
                    {logs.data.length > 0 ? (
                        logs.data.map((log, idx) => (
                            <Box
                                key={`${caseFolderId}-log-${idx}`}
                                sx={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    gap: 1.5,
                                    py: 0.25,
                                    px: 0.5,
                                    borderBottom: "1px solid #333",
                                    "&:last-child": {borderBottom: "none"},
                                    "&:hover": {bgcolor: "#2a2a2a"},
                                }}
                            >
                                <Typography
                                    component="span"
                                    sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.72rem",
                                        color: "#4fc3f7",
                                        whiteSpace: "nowrap",
                                        flexShrink: 0,
                                    }}
                                >
                                    {log.Created}
                                </Typography>
                                <Typography
                                    component="span"
                                    sx={{
                                        fontFamily: "monospace",
                                        fontSize: "0.75rem",
                                        color: "#fff",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {log.LogText}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="caption" sx={{color: "#aaa", fontFamily: "monospace"}}>
                            Nu există loguri.
                        </Typography>
                    )}
                </Box>
            )}
        </Paper>
    );
};