import {useCallback, useMemo, useRef, useState} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Button, Typography, Box, Divider, Stack, Paper, IconButton
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HistoryIcon from "@mui/icons-material/History";
import ArticleIcon from "@mui/icons-material/Article";
import DownloadIcon from "@mui/icons-material/Download";
import {AccordionItem} from "./Accordion-item.tsx";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import {useGetGeomByCasefolderid} from "../../connect/get-geom-by-casefolderid.ts";
import {parseMobilePosition} from "../../utils/shapeXmlToGeoJSON.ts";
import type {ApiCaseFolderIdResponse, GeometryWithDate} from "../../connect/types.ts";
import {parseTime} from "../../utils/parse-time.ts";
import {getSsuIconType} from "../../utils/parse-ssu-icon.ts";
import Doc from "../../assets/doc.png";
import {useGetLogsByCasefolderId} from "../../connect/get-logs-by-casefolderid.ts";
import {useStoreCaseTypeName} from "../../store/useStoreCaseTypeName.ts";
import {parseAudioFileName} from "../../utils/parse-audio-name.ts";

const soundPath = import.meta.env.VITE_SOUND_PATH;

// ---------- Tipuri ----------

interface LogEntry {
    Created: string;
    LogText: string;
}

interface AudioFile {
    FileName?: string;
    OperatorName?: string;
}

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
    disableFilter?: boolean;
}

// ---------- Hook generic: fetch + cache + loading + eroare, per id numeric ----------

interface CachedFetchState<T> {
    data: Record<number, T[]>;
    loading: Record<number, boolean>;
    error: Record<number, string | null>;
    load: (id: number, fetcher: () => Promise<T[]>) => Promise<void>;
    reset: (id: number) => void;
}

function useCachedFetch<T>(): CachedFetchState<T> {
    const [data, setData] = useState<Record<number, T[]>>({});
    const [loading, setLoading] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<Record<number, string | null>>({});

    const load = useCallback(async (id: number, fetcher: () => Promise<T[]>) => {
        // Nu reîncărcăm dacă avem deja date cache-uite sau dacă e deja în curs
        if (data[id] || loading[id]) return;

        setLoading(prev => ({...prev, [id]: true}));
        setError(prev => ({...prev, [id]: null}));

        try {
            const resp = await fetcher();
            setData(prev => ({...prev, [id]: Array.isArray(resp) ? resp : []}));
        } catch (err) {
            console.error("Eroare la preluarea datelor:", err);
            setError(prev => ({
                ...prev,
                [id]: err instanceof Error ? err.message : "Eroare necunoscută la încărcare.",
            }));
        } finally {
            setLoading(prev => ({...prev, [id]: false}));
        }

    }, [data, loading]);

    const reset = useCallback((id: number) => {
        setData(prev => {
            const next = {...prev};
            delete next[id];
            return next;
        });
        setError(prev => ({...prev, [id]: null}));
    }, []);

    return {data, loading, error, load, reset};
}

/**
 * Componenta principală care randează lista de cazuri sub formă de acordeoane.
 * Include logici pentru filtrare, preluare geometrie (AML/MLP) și loguri de activitate.
 */
export const AccordionComponent = ({data, disableFilter = false}: Props) => {
    // Normalizăm datele într-un array pentru consistență la mapare
    const item = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);

    // Hook pentru starea filtrelor de organizație (Ambulanță, Poliție, Pompieri)
    const {selectedOrgs} = useStoreCaseTypeName();

    // Stare UI locală
    const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({});
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Cele trei tipuri de date fetch-uite pe cerere, fiecare cu propriul cache/loading/error
    const geom = useCachedFetch<GeometryWithDate>();
    const logs = useCachedFetch<LogEntry>();
    const audio = useCachedFetch<AudioFile>();

    const currentlyPlayingRef = useRef<HTMLAudioElement | null>(null);

    // Hook-uri din store-uri globale pentru interacțiunea cu harta
    const setPointOnMap = useStoreAddPointOnMap(s => s.setCoordinate);
    const resetPointOnMap = useStoreAddPointOnMap(s => s.resetCoordinates);
    const resetFeatures = useStoreGeometryFromCaseFolderId(s => s.resetSelectedFeature);
    const addUniqueGeometries = useStoreGeometryFromCaseFolderId(s => s.addUniqueFeature);

    // Hook-uri pentru apeluri API
    const {fetchGeom} = useGetGeomByCasefolderid();
    const {fetchLogs} = useGetLogsByCasefolderId();

    /**
     * Player Audio — se asigură că doar un singur element <audio> cântă simultan.
     */
    const handlePlay = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
        const audioElement = e.currentTarget;
        if (currentlyPlayingRef.current && currentlyPlayingRef.current !== audioElement) {
            currentlyPlayingRef.current.pause();
        }
        currentlyPlayingRef.current = audioElement;
    }, []);

    const handleAudio = useCallback((id: number) => {
        return audio.load(id, () =>
            fetch(`${soundPath}/audio/list/${id}`).then(res => {
                if (!res.ok) throw new Error(`Serverul audio a răspuns cu status ${res.status}`);
                return res.json();
            })
        );
    }, [audio]);

    /**
     * Filtrează lista de cazuri în funcție de organizațiile selectate în MapControls.
     * Dacă niciun filtru nu e selectat, se afișează toate cazurile.
     */
    const filteredItems = useMemo(() => {
        if (disableFilter) return item;

        return item.filter(itm => {
            const typeName = itm.caseTypeName?.toLowerCase() || "";

            const ambulance = selectedOrgs["Ambulanță"] ?? false;
            const police = selectedOrgs["Poliție"] ?? false;
            const fire = selectedOrgs["Pompieri"] ?? false;

            const noFilterSelected = !ambulance && !police && !fire;
            if (noFilterSelected) return true;

            const matchAmbulance = ambulance && (typeName.includes("ambulan") || typeName.includes("903"));
            const matchPolice = police && (typeName.includes("poli") || typeName.includes("902") || typeName.includes("igp"));
            const matchFire = fire && (typeName.includes("pompier") || typeName.includes("901") || typeName.includes("dse"));

            return matchAmbulance || matchPolice || matchFire;
        });
    }, [item, disableFilter, selectedOrgs]);

    /**
     * Preia datele de localizare (geometria) pentru un caz specific.
     * Filtrează rezultatele pentru a păstra doar tipurile AML și MLP valide.
     */
    const handleAML = useCallback((id: number) => {
        resetFeatures();
        resetPointOnMap();

        return geom.load(id, async () => {
            const resp = await fetchGeom(id);
            if (!Array.isArray(resp)) return [];

            return resp
                .map(g => {
                    const parsed = parseMobilePosition(g.MobilePosition || g.geometry);
                    if (!parsed) return null;
                    return {
                        geometry: parsed,
                        created: parsed.time,
                    };
                })
                .filter((g): g is GeometryWithDate => g !== null);
        });

    }, [fetchGeom, geom, resetFeatures, resetPointOnMap]);

    /**
     * Preia logurile de activitate pentru un caz specific.
     */
    const handleLogs = useCallback((id: number) => {
        return logs.load(id, async () => {
            const resp = await fetchLogs(id);
            return Array.isArray(resp) ? resp : [];
        });

    }, [fetchLogs, logs]);

    const downloadAudio = useCallback(async (url: string, fileName: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Descărcare eșuată (status ${response.status})`);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName.endsWith(".mp3") ? fileName : `${fileName}.mp3`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Eroare la descărcarea fișierului:", error);
        }
    }, []);

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 1}}>
            {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                    const caseFolderId = item.caseFolderId ?? (item as any).CaseFolderId;
                    const caseId = item.caseId;
                    if (caseFolderId === undefined) return null;

                    const uniqueRowKey = `${caseFolderId}-${caseId}`;

                    return (
                        <Accordion
                            key={uniqueRowKey}
                            expanded={expandedId === uniqueRowKey}
                            onChange={(_, expanded) => {
                                setExpandedId(expanded ? uniqueRowKey : null);
                                if (expanded) handleAML(caseFolderId);
                            }}
                            sx={{
                                borderRadius: "8px !important",
                                "&:before": {display: "none"},
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                        >
                            {/* Antet: ID caz, iconiță tip, buton expand */}
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <img src={Doc} style={{width: 24, height: 24}} alt="Document caz"/>
                                    <Typography sx={{fontWeight: "bold", minWidth: "80px"}}>
                                        #{caseFolderId}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem/>
                                    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                                        <img
                                            src={getSsuIconType(item.caseTypeId ?? 0)}
                                            style={{width: "auto", height: 28}}
                                            alt={`Tip caz: ${item.caseTypeName ?? "necunoscut"}`}
                                        />
                                    </Box>
                                </Stack>
                            </AccordionSummary>

                            <AccordionDetails sx={{pt: 0, px: 3, pb: 3}}>
                                <Divider sx={{mb: 2}}/>

                                {/* Grid de informații de bază */}
                                <Box sx={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3}}>
                                    <AccordionItem label="Creator" value={item.creator}/>
                                    <AccordionItem label="Timp Creare" value={parseTime(item.created)}/>
                                    <AccordionItem label="Tip caz" value={item.caseTypeName}/>
                                    <AccordionItem label="Nivel 1" value={item.caseIndex1Name}/>
                                    <AccordionItem label="Nivel 2" value={item.caseIndex2Name}/>
                                    <AccordionItem label="Telefon" value={item.phoneNumber}/>
                                    <AccordionItem label="Apelant" value={item.orderer ?? " - -"}/>
                                    <AccordionItem label="Address" value={item.address}/>


                                    <Box sx={{gridColumn: "span 2"}}>
                                        <AccordionItem label="Comentarii caz"
                                                       value={item.caseIndexComment || "Fără comentarii"}/>
                                    </Box>
                                    <Box sx={{gridColumn: "span 2"}}>
                                        <AccordionItem label="Comentarii dosar"
                                                       value={item.caseFolderIndexComment || "Fără comentarii"}/>
                                    </Box>
                                </Box>

                                {/* Loguri de activitate */}
                                <Stack direction="column" spacing={2}>
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: "#f8f9fa"}}>
                                        <Typography variant="subtitle2"
                                                    sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <ArticleIcon fontSize="small" color="action"/> Loguri Activitate
                                        </Typography>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center"
                                               sx={{mb: 1}}>

                                            {!logs.data[caseFolderId] && (

                                                <Button
                                                    fullWidth={true}
                                                    variant="contained"
                                                    color={"inherit"}
                                                    onClick={() => handleLogs(caseFolderId)}
                                                    disabled={logs.loading[caseFolderId]}
                                                >
                                                    {logs.loading[caseFolderId] ? "Se încarcă..." : "Vezi Loguri"}
                                                </Button>

                                            )}
                                        </Stack>

                                        {logs.error[caseFolderId] && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="caption" color="error">
                                                    {logs.error[caseFolderId]}
                                                </Typography>
                                                <Button size="small" onClick={() => handleLogs(caseFolderId)}>
                                                    Reîncearcă
                                                </Button>
                                            </Stack>
                                        )}

                                        {logs.data[caseFolderId] && (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 0.5,
                                                    maxHeight: 250,
                                                    overflowY: "auto",
                                                    bgcolor: "#1e1e1e", // fundal închis stil consolă/database sau '#f8f9fa' dacă preferi deschis
                                                    p: 1,
                                                    borderRadius: 1,
                                                    fontFamily: "monospace",
                                                }}
                                            >
                                                {logs.data[caseFolderId].length > 0 ? (
                                                    logs.data[caseFolderId].map((log, idx) => (
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
                                                            {/* Timestamp-ul ca în DB */}
                                                            <Typography
                                                                component="span"
                                                                sx={{
                                                                    fontFamily: "monospace",
                                                                    fontSize: "0.72rem",
                                                                    color: "#4fc3f7", // albastru deschis pentru timp
                                                                    whiteSpace: "nowrap",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {parseTime(log.Created)}
                                                            </Typography>

                                                            {/* Textul logului pe același rând */}
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
                                                    <Typography variant="caption"
                                                                sx={{color: "#aaa", fontFamily: "monospace"}}>
                                                        Nu există loguri.
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Paper>
                                </Stack>
                                <Stack direction="column" spacing={2} sx={{mt: "16px"}}>
                                    {/* Localizare Operator */}
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: "#fffaf0"}}>
                                        <Typography variant="subtitle2" gutterBottom
                                                    sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <LocationOnIcon fontSize="small" color="warning"/> Localizare Operator
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="warning"
                                            disabled={!item.xCoordinate || !item.yCoordinate}
                                            onClick={() =>
                                                item.xCoordinate &&
                                                item.yCoordinate &&
                                                setPointOnMap({
                                                    XCoordinate: item.xCoordinate,
                                                    YCoordinate: item.yCoordinate,
                                                })
                                            }
                                            sx={{textTransform: "none", borderRadius: 2}}
                                        >
                                            Setați coordonatele pe hartă
                                        </Button>
                                    </Paper>

                                    {/* Înregistrări Audio */}
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            bgcolor: "#f0f4f8",
                                            mt: 2,
                                            minHeight: "50px",
                                            maxHeight: "300px",
                                            overflow: audio.data[caseFolderId] ? "auto" : "hidden",
                                            transition: "min-height 0.2s ease",
                                        }}
                                    >
                                        <Typography variant="subtitle2" gutterBottom
                                                    sx={{display: "flex", alignItems: "center", gap: 1}}>
                                            <HistoryIcon fontSize="small" color="secondary"/> Înregistrări Apel
                                        </Typography>

                                        {audio.error[caseFolderId] && (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
                                                <Typography variant="caption" color="error">
                                                    {audio.error[caseFolderId]}
                                                </Typography>
                                                <Button size="small" onClick={() => handleAudio(caseFolderId)}>
                                                    Reîncearcă
                                                </Button>
                                            </Stack>
                                        )}

                                        {!audio.data[caseFolderId] ? (
                                            <Button
                                                fullWidth={true}
                                                variant="contained"
                                                color={"secondary"}
                                                onClick={() => handleAudio(caseFolderId)}
                                                disabled={audio.loading[caseFolderId]}
                                            >
                                                {audio.loading[caseFolderId] ? "Se încarcă..." : "Încarcă Înregistrări"}
                                            </Button>
                                        ) : (
                                            <Stack spacing={1}>
                                                {audio.data[caseFolderId].length > 0 ? (
                                                    audio.data[caseFolderId].map((file, index) => {
                                                        const audioUrl = `${soundPath}/audio/stream/${caseFolderId}/${index}`;
                                                        const fileName =
                                                            file.FileName || file.OperatorName || `Inregistrare_${caseFolderId}_${index + 1}`;

                                                        return (
                                                            <Box key={`${caseFolderId}-audio-${index}`} sx={{mb: 2}}>
                                                                <Typography variant="caption" sx={{
                                                                    display: "block",
                                                                    mb: 0.5,
                                                                    fontWeight: 450
                                                                }}>
                                                                    {(() => {
                                                                        const parsed = parseAudioFileName(fileName || '');
                                                                        return parsed
                                                                            ? `${parsed.date} ${parsed.time} — ${parsed.operator} (${parsed.workstation})`
                                                                            : fileName;
                                                                    })()}
                                                                </Typography>

                                                                <Stack direction="row" alignItems="center" spacing={1}
                                                                       sx={{width: "340px"}}>
                                                                    <audio
                                                                        controls
                                                                        preload="none"
                                                                        style={{
                                                                            width: "100%",
                                                                            minWidth: "100%", // Forțează lățimea minimă
                                                                            height: "35px",
                                                                            flexGrow: 1,
                                                                        }}
                                                                        onPlay={handlePlay}
                                                                    >
                                                                        <source src={audioUrl} type="audio/mpeg"/>
                                                                    </audio>

                                                                    <IconButton
                                                                        size="small"
                                                                        aria-label={`Descarcă înregistrarea ${fileName}`}
                                                                        onClick={() => downloadAudio(audioUrl, fileName)}
                                                                        sx={{
                                                                            bgcolor: "primary.main",
                                                                            color: "white",
                                                                            flexShrink: 0,
                                                                            "&:hover": {bgcolor: "primary.dark"},
                                                                        }}
                                                                    >
                                                                        <DownloadIcon fontSize="small"/>
                                                                    </IconButton>
                                                                </Stack>
                                                            </Box>
                                                        );
                                                    })
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Nu s-au găsit înregistrări.
                                                    </Typography>
                                                )}
                                            </Stack>
                                        )}
                                    </Paper>

                                    {/* Istoric Locații AML/MLP */}
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: "#f5faff"}}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="subtitle2" gutterBottom
                                                        sx={{display: "flex", alignItems: "center", gap: 1}}>
                                                <HistoryIcon fontSize="small" color="primary"/> Istoric Locații
                                                (AML/MLP)
                                            </Typography>
                                        </Stack>

                                        {geom.error[caseFolderId] && (
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
                                                <Typography variant="caption" color="error">
                                                    {geom.error[caseFolderId]}
                                                </Typography>
                                                <Button size="small" onClick={() => handleAML(caseFolderId)}>
                                                    Reîncearcă
                                                </Button>
                                            </Stack>
                                        )}

                                        {geom.loading[caseFolderId] && (
                                            <Typography variant="caption" color="text.secondary">
                                                Se încarcă locațiile...
                                            </Typography>
                                        )}

                                        {geom.data[caseFolderId]?.length > 0 ? (
                                            <Box sx={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: 1,
                                                justifyContent: "center"
                                            }}>
                                                {geom.data[caseFolderId].map((g, n) => (
                                                    <Button
                                                        key={`${caseFolderId}-geom-${n}`}
                                                        fullWidth
                                                        variant={selectedIdx[caseFolderId] === n ? "contained" : "outlined"}
                                                        color={selectedIdx[caseFolderId] === n ? "primary" : "info"}
                                                        onClick={() => {
                                                            addUniqueGeometries([{
                                                                features: g.geometry.feature,
                                                                type: g.geometry.type
                                                            }]);
                                                            setSelectedIdx(prev => ({...prev, [caseFolderId]: n}));
                                                        }}
                                                        sx={{
                                                            justifyContent: "flex-center", // Aliniază textul la stânga dacă e fullWidth
                                                            textTransform: "none",        // Păstrează textul exact așa cum e (fără UPPERCASE)
                                                            mb: 1                         // Spațiere între butoane când sunt unul sub altul
                                                        }}
                                                    >
                                                        {`${g.geometry.type} | ${parseTime(g.created)}`}
                                                    </Button>
                                                ))}
                                            </Box>
                                        ) : (
                                            !geom.loading[caseFolderId] &&
                                            !geom.error[caseFolderId] && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Nu s-au găsit date de localizare automată.
                                                </Typography>
                                            )
                                        )}
                                    </Paper>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            ) : (
                <Paper sx={{p: 3, textAlign: "center", bgcolor: "#fdfdfd"}}>
                    <Typography color="text.secondary">Niciun rezultat.</Typography>
                </Paper>
            )}
        </Box>
    );
};