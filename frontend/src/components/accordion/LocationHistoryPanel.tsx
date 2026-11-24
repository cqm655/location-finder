import {useEffect, useState} from "react";
import {Box, Button, Paper, Stack, Typography} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import {useGetGeomByCasefolderid} from "../../connect/get-geom-by-casefolderid.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import {parseMobilePosition} from "../../utils/shapeXmlToGeoJSON.ts";
import type {GeometryWithDate} from "../../connect/types.ts";
import {useLazyFetch} from "../../hooks/useLazyFetch.ts";

interface Props {
    caseFolderId: number;
    expanded: boolean; // se încarcă automat când acordeonul se deschide
}

const parseTimeForLocationHistory = (value: Date | string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("ro-RO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Chisinau",
    });
};


export const LocationHistoryPanel = ({caseFolderId, expanded}: Props) => {
    const {fetchGeom} = useGetGeomByCasefolderid();
    const addUniqueGeometries = useStoreGeometryFromCaseFolderId((s) => s.addUniqueFeature);
    const geom = useLazyFetch<GeometryWithDate>();
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const handleLoad = () =>
        geom.load(async () => {
            const resp = await fetchGeom(caseFolderId);
            if (!Array.isArray(resp)) return [];

            const mapped = resp.flatMap((g): GeometryWithDate[] => {
                const parsed = parseMobilePosition(g.MobilePosition || g.geometry);
                if (!parsed) return [];
                return [{geometry: parsed, created: parsed.time ?? " "}];
            });

            // Sortare: de la cel mai recent (ultimul timp) spre cel mai vechi
            return mapped.sort((a, b) => {
                const timeA = new Date(a.created).getTime();
                const timeB = new Date(b.created).getTime();

                if (isNaN(timeA) || isNaN(timeB)) return 0;

                return timeB - timeA; // Cel mai nou sus
            });
        });

    // Rulează doar când `expanded` se schimbă
    useEffect(() => {
        if (expanded) void handleLoad();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expanded]);

    return (
        <Paper variant="outlined" sx={{p: 2, bgcolor: "#f5faff"}}>
            <Typography variant="subtitle2" gutterBottom sx={{display: "flex", alignItems: "center", gap: 1}}>
                <HistoryIcon fontSize="small" color="primary"/> Istoric Locații (AML/MLP)
            </Typography>

            {geom.error && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
                    <Typography variant="caption" color="error">{geom.error}</Typography>
                    <Button size="small" onClick={handleLoad}>Reîncearcă</Button>
                </Stack>
            )}

            {geom.loading && (
                <Typography variant="caption" color="text.secondary">Se încarcă locațiile...</Typography>
            )}

            {geom.data && geom.data.length > 0 ? (
                <Box sx={{display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center"}}>
                    {geom.data.map((g: any, n: number) => (
                        <Button
                            key={`${caseFolderId}-geom-${n}`}
                            fullWidth
                            variant={selectedIdx === n ? "contained" : "outlined"}
                            color={selectedIdx === n ? "primary" : "info"}
                            onClick={() => {
                                addUniqueGeometries([{features: g.geometry.feature, type: g.geometry.type}]);
                                setSelectedIdx(n);
                            }}
                            sx={{textTransform: "none", mb: 1}}
                        >
                            {`${g.geometry.type} | ${parseTimeForLocationHistory(g.created)}`}
                        </Button>
                    ))}
                </Box>
            ) : (
                !geom.loading &&
                !geom.error && (
                    <Typography variant="caption" color="text.secondary">
                        Nu s-au găsit date de localizare automată.
                    </Typography>
                )
            )}
        </Paper>
    );
};