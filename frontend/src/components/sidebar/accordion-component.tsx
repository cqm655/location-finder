import {useMemo, useState} from "react";
import {Box, Paper, Typography} from "@mui/material";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {FolderAccordionItem} from "../accordion/FolderAccordionItem.tsx";

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
    disableFilter?: boolean;
}

export const AccordionComponent = ({data}: Props) => {
    const items = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);

    // Grupăm fișele după caseFolderId (păstrăm ordinea inițială)
    const folders = useMemo(() => {
        const map = new Map<number, ApiCaseFolderIdResponse[]>();
        items.forEach((item) => {
            if (item.caseFolderId === undefined) return;
            const list = map.get(item.caseFolderId) ?? [];
            list.push(item);
            map.set(item.caseFolderId, list);
        });
        return Array.from(map.entries());
    }, [items]);

    const [expandedId, setExpandedId] = useState<number | null>(null);

    return (
        <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 1}}>
            {folders.length > 0 ? (
                folders.map(([caseFolderId, cases]) => (
                    <FolderAccordionItem
                        key={caseFolderId}
                        caseFolderId={caseFolderId}
                        cases={cases}
                        expanded={expandedId === caseFolderId}
                        onToggle={(isExpanded) => setExpandedId(isExpanded ? caseFolderId : null)}
                    />
                ))
            ) : (
                <Paper sx={{p: 3, textAlign: "center", bgcolor: "#fdfdfd"}}>
                    <Typography color="text.secondary">Niciun rezultat.</Typography>
                </Paper>
            )}
        </Box>
    );
};
// import {useMemo, useState} from "react";
// import {Box, Paper, Typography} from "@mui/material";
// import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
// import {CaseAccordionItem} from "../accordion/CaseAccordionItem.tsx";
//
//
// interface Props {
//     data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
//     disableFilter?: boolean;
// }
//
// export const AccordionComponent = ({data}: Props) => {
//     const items = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);
//     const [expandedId, setExpandedId] = useState<string | null>(null);
//
//     return (
//         <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 1}}>
//             {items.length > 0 ? (
//                 items.map((item) => {
//                     const key = `${item.caseFolderId}-${item.caseId}`;
//                     return (
//                         <CaseAccordionItem
//                             key={key}
//                             item={item}
//                             expanded={expandedId === key}
//                             onToggle={(isExpanded) => setExpandedId(isExpanded ? key : null)}
//                         />
//                     );
//                 })
//             ) : (
//                 <Paper sx={{p: 3, textAlign: "center", bgcolor: "#fdfdfd"}}>
//                     <Typography color="text.secondary">Niciun rezultat.</Typography>
//                 </Paper>
//             )}
//         </Box>
//     );
// };
//
//
// // import {useCallback, useMemo, useRef, useState} from "react";
// // import {
// //     Accordion, AccordionDetails, AccordionSummary,
// //     Button, Typography, Box, Divider, Stack, Paper
// // } from "@mui/material";
// // import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// // import LocationOnIcon from "@mui/icons-material/LocationOn";
// // import HistoryIcon from "@mui/icons-material/History";
// // import ArticleIcon from "@mui/icons-material/Article";
// // import {AccordionItem} from "./Accordion-item.tsx";
// // import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
// // import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
// // import {useGetGeomByCasefolderid} from "../../connect/get-geom-by-casefolderid.ts";
// // import {parseMobilePosition} from "../../utils/shapeXmlToGeoJSON.ts";
// // import type {
// //     ApiCaseFolderIdResponse,
// //     GeometryWithDate,
// //     LocationItem
// // } from "../../connect/types.ts";
// // import {parseTime} from "../../utils/parse-time.ts";
// // import {getSsuIconType} from "../../utils/parse-ssu-icon.ts";
// // import Doc from "../../assets/doc.png";
// // import {useGetLogsByCasefolderId} from "../../connect/get-logs-by-casefolderid.ts";
// // //import {useStoreCaseTypeName} from "../../store/useStoreCaseTypeName.ts";
// // import {useGetSoundFiles} from "../../connect/get-sound-files.ts";
// // import {AudioPlayerItem} from "../audio-player/audio-player.tsx";
// // import TravelExploreIcon from "@mui/icons-material/TravelExplore";
// // import {useStoreSeqSearch} from "../../store/useStoreSeqSearch.ts";
// //
// // // ---------- Tipuri ----------
// //
// // interface LogEntry {
// //     Created: string;
// //     LogText: string;
// // }
// //
// // interface AudioFile {
// //     FileName?: string;
// //     OperatorName?: string;
// // }
// //
// // interface Props {
// //     data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
// //     disableFilter?: boolean;
// // }
// //
// //
// // // ---------- Hook generic: fetch + cache + loading + eroare, per id numeric ----------
// //
// // interface CachedFetchState<T> {
// //     data: Record<number, T[]>;
// //     loading: Record<number, boolean>;
// //     error: Record<number, string | null>;
// //     load: (id: number, fetcher: () => Promise<T[]>) => Promise<void>;
// //     reset: (id: number) => void;
// // }
// //
// // function useCachedFetch<T>(): CachedFetchState<T> {
// //     const [data, setData] = useState<Record<number, T[]>>({});
// //     const [loading, setLoading] = useState<Record<number, boolean>>({});
// //     const [error, setError] = useState<Record<number, string | null>>({});
// //
// //
// //     const load = useCallback(async (id: number, fetcher: () => Promise<T[]>) => {
// //         if (data[id] || loading[id]) return;
// //
// //         setLoading(prev => ({...prev, [id]: true}));
// //         setError(prev => ({...prev, [id]: null}));
// //
// //         try {
// //             const resp = await fetcher();
// //             setData(prev => ({...prev, [id]: Array.isArray(resp) ? resp : []}));
// //         } catch (err) {
// //             console.error("Eroare la preluarea datelor:", err);
// //             setError(prev => ({
// //                 ...prev,
// //                 [id]: err instanceof Error ? err.message : "Eroare necunoscută la încărcare.",
// //             }));
// //         } finally {
// //             setLoading(prev => ({...prev, [id]: false}));
// //         }
// //
// //     }, [data, loading]);
// //
// //     const reset = useCallback((id: number) => {
// //         setData(prev => {
// //             const next = {...prev};
// //             delete next[id];
// //             return next;
// //         });
// //         setError(prev => ({...prev, [id]: null}));
// //     }, []);
// //
// //     return {data, loading, error, load, reset};
// // }
// //
// // /**
// //  * Componenta principală care randează lista de cazuri sub formă de acordeoane.
// //  * Include logici pentru filtrare, preluare geometrie (AML/MLP) și loguri de activitate.
// //  */
// // export const AccordionComponent = ({data, /**disableFilter = false*/}: Props) => {
// //     // Normalizăm datele într-un array pentru consistență la mapare
// //     const item = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);
// //
// //     // Hook pentru starea filtrelor de organizație (Ambulanță, Poliție, Pompieri)
// //     // const {selectedOrgs} = useStoreCaseTypeName();
// //
// //     // Stare UI locală
// //     const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({});
// //     const [expandedId, setExpandedId] = useState<string | null>(null);
// //
// //     // Cele trei tipuri de date fetch-uite pe cerere, fiecare cu propriul cache/loading/error
// //     const geom = useCachedFetch<GeometryWithDate>();
// //     const logs = useCachedFetch<LogEntry>();
// //     const audio = useCachedFetch<AudioFile>();
// //
// //     const currentlyPlayingRef = useRef<HTMLAudioElement | null>(null);
// //
// //     // Hook-uri din store-uri globale pentru interacțiunea cu harta
// //     const setPointOnMap = useStoreAddPointOnMap(s => s.setCoordinate);
// //     const resetPointOnMap = useStoreAddPointOnMap(s => s.resetCoordinates);
// //     const resetFeatures = useStoreGeometryFromCaseFolderId(s => s.resetSelectedFeature);
// //     const addUniqueGeometries = useStoreGeometryFromCaseFolderId(s => s.addUniqueFeature);
// //
// //     // Hook-uri pentru apeluri API
// //     const {fetchGeom} = useGetGeomByCasefolderid();
// //     const {fetchLogs} = useGetLogsByCasefolderId();
// //
// //     // Hook - uri pentru apeluri API catre SEQ
// //     // const {fetchSeqGeom, seqIsLoading, seqError} = useGetLocationFromSeq();
// //
// //     // Hook pentru audio
// //     const {fetchSoundFiles} = useGetSoundFiles();
// //
// //     /**
// //      * Handle seq requsts
// //      */
// //
// //
// //     const seqResults = useStoreSeqSearch((state) => state.results);
// //     const seqLoading = useStoreSeqSearch((state) => state.loading);
// //     const seqError = useStoreSeqSearch((state) => state.error);
// //     const seqSearched = useStoreSeqSearch((state) => state.searched);
// //     const searchSeq = useStoreSeqSearch((state) => state.search);
// //
// //     const [selectedSeqIdx, setSelectedSeqIdx] = useState<number | null>(null);
// //
// //     const handleSeqLocations = useCallback(
// //         async (phone?: string, caseFolderId?: string) => {
// //             const normalizedPhone = phone
// //                 ?.trim()
// //                 .replace(/\D/g, "")
// //                 .replace(/^0+/, "");
// //
// //             if (!normalizedPhone) return;
// //
// //             const to = new Date();
// //             const from = new Date(to.getTime() - 3 * 60 * 60 * 1000);
// //
// //             setSelectedSeqIdx(null);
// //
// //             await searchSeq({
// //                 phone: normalizedPhone,
// //                 caseFolderId,
// //                 from: from.toISOString(),
// //                 to: to.toISOString(),
// //             });
// //         },
// //         [searchSeq]
// //     );
// //
// //
// //     const showSeqOnMap = useCallback(
// //         (index: number, location: LocationItem) => {
// //             setSelectedSeqIdx(index);
// //
// //             if (location.kind === "AML") {
// //                 setPointOnMap({
// //                     XCoordinate: location.center.lat,
// //                     YCoordinate: location.center.lon,
// //                 });
// //
// //                 return;
// //             }
// //
// //             // MLP: afișează poligonul, dacă există.
// //             if (location.polygon && location.polygon.length >= 3) {
// //                 let coordinates: number[][] = location.polygon.map(
// //                     (point) => [point.lon, point.lat]
// //                 );
// //
// //                 const first = coordinates[0];
// //                 const last = coordinates[coordinates.length - 1];
// //
// //                 // GeoJSON cere un inel închis.
// //                 if (first[0] !== last[0] || first[1] !== last[1]) {
// //                     coordinates = [...coordinates, [...first]];
// //                 }
// //
// //                 addUniqueGeometries([
// //                     {
// //                         type: "MLP",
// //                         features: {
// //                             type: "FeatureCollection",
// //                             features: [
// //                                 {
// //                                     type: "Feature",
// //                                     geometry: {
// //                                         type: "Polygon",
// //                                         coordinates: [coordinates],
// //                                     },
// //                                     properties: {
// //                                         kind: location.kind,
// //                                         timeUtc: location.timeUtc,
// //                                         phone: location.phone,
// //                                     },
// //                                 },
// //                             ],
// //                         },
// //                     },
// //                 ]);
// //
// //                 return;
// //             }
// //
// //             // Dacă MLP nu are poligon, afișează centrul.
// //             setPointOnMap({
// //                 XCoordinate: location.center.lon,
// //                 YCoordinate: location.center.lat,
// //             });
// //         },
// //         [setPointOnMap, addUniqueGeometries]
// //     );
// //
// //
// //     /**
// //      * Player Audio — se asigură că doar un singur element <audio> cântă simultan.
// //      */
// //     const handlePlay = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
// //         const audioElement = e.currentTarget;
// //         if (currentlyPlayingRef.current && currentlyPlayingRef.current !== audioElement) {
// //             currentlyPlayingRef.current.pause();
// //         }
// //         currentlyPlayingRef.current = audioElement;
// //     }, []);
// //
// //     /**
// //      * Preia fișierele audio înregistrate pentru un caz specific.
// //      */
// //     const handleAudio = useCallback((id: number) => {
// //         return audio.load(id, async () => {
// //             const resp = await fetchSoundFiles(id);
// //             return Array.isArray(resp) ? resp : [];
// //         });
// //     }, [fetchSoundFiles, audio]);
// //
// //     /**
// //      * Filtrează lista de cazuri în funcție de organizațiile selectate.
// //      */
// //     // const filteredItems = useMemo(() => {
// //     //     if (disableFilter) return item;
// //     //
// //     //     return item.filter(itm => {
// //     //         const typeName = itm.caseTypeName?.toLowerCase() || "";
// //     //
// //     //         const ambulance = selectedOrgs["Ambulanță"] ?? false;
// //     //         const police = selectedOrgs["Poliție"] ?? false;
// //     //         const fire = selectedOrgs["Pompieri"] ?? false;
// //     //
// //     //         const noFilterSelected = !ambulance && !police && !fire;
// //     //         if (noFilterSelected) return true;
// //     //         // const matchAmbulance = ambulance && (typeName.includes("ambulan") || typeName.includes("903"));
// //     //         // const matchPolice = police && (typeName.includes("poli") || typeName.includes("902") || typeName.includes("igp"));
// //     //         // const matchFire = fire && (typeName.includes("pompier") || typeName.includes("901") || typeName.includes("dse"));
// //     //
// //     //         return ambulance || police || fire;
// //     //         // return matchAmbulance || matchPolice || matchFire;
// //     //     });
// //     // }, [item, disableFilter, selectedOrgs]);
// //
// //     /**
// //      * Preia datele de localizare (geometria) pentru un caz specific.
// //      */
// //     const handleAML = useCallback((id: number) => {
// //         resetFeatures();
// //         resetPointOnMap();
// //
// //         return geom.load(id, async () => {
// //             const resp = await fetchGeom(id);
// //             if (!Array.isArray(resp)) return [];
// //
// //             return resp.flatMap((g): GeometryWithDate[] => {
// //                 const parsed = parseMobilePosition(g.MobilePosition || g.geometry);
// //                 if (!parsed) return [];
// //
// //                 return [{
// //                     geometry: parsed,
// //                     created: parsed.time ?? ' ', // ensure type compatibility with GeometryWithDate
// //                 }];
// //             });
// //         });
// //     }, [fetchGeom, geom, resetFeatures, resetPointOnMap]);
// //
// //     /**
// //      * Preia logurile de activitate pentru un caz specific.
// //      */
// //     const handleLogs = useCallback((id: number) => {
// //         return logs.load(id, async () => {
// //             const resp = await fetchLogs(id);
// //             return Array.isArray(resp) ? resp : [];
// //         });
// //
// //     }, [fetchLogs, logs]);
// //
// //     return (
// //         <Box sx={{display: "flex", flexDirection: "column", gap: 1, p: 1}}>
// //             {item.length > 0 ? (
// //                 item.map(item => {
// //                     const caseFolderId: number = item.caseFolderId!;
// //                     const caseId: number = item.caseId!;
// //                     if (caseFolderId === undefined) return null;
// //
// //                     const uniqueRowKey = `${caseFolderId}-${caseId}`;
// //
// //                     return (
// //                         <Accordion
// //                             key={uniqueRowKey}
// //                             expanded={expandedId === uniqueRowKey}
// //                             onChange={(_, expanded) => {
// //                                 setExpandedId(expanded ? uniqueRowKey : null);
// //                                 if (expanded) handleAML(caseFolderId);
// //                             }}
// //                             sx={{
// //                                 borderRadius: "8px !important",
// //                                 "&:before": {display: "none"},
// //                                 boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
// //                             }}
// //                         >
// //                             {/* Antet: ID caz, iconiță tip, buton expand */}
// //                             <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
// //                                 <Stack direction="row" alignItems="center" spacing={2}>
// //                                     <img src={Doc} style={{width: 24, height: 24}} alt="Document caz"/>
// //                                     <Typography sx={{fontWeight: "bold", minWidth: "80px"}}>
// //                                         #{caseFolderId}
// //                                     </Typography>
// //                                     <Divider orientation="vertical" flexItem/>
// //                                     <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
// //                                         <img
// //                                             src={getSsuIconType(item.caseTypeId ?? 0)}
// //                                             style={{width: "auto", height: 28}}
// //                                             alt={`Tip caz: ${item.caseTypeName ?? "necunoscut"}`}
// //                                         />
// //                                     </Box>
// //                                 </Stack>
// //                             </AccordionSummary>
// //
// //                             <AccordionDetails sx={{pt: 0, px: 3, pb: 3}}>
// //                                 <Divider sx={{mb: 2}}/>
// //
// //                                 {/* Grid de informații de bază */}
// //                                 <Box sx={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3}}>
// //                                     <AccordionItem label="Creator" value={item.creator}/>
// //                                     <AccordionItem label="Timp Creare" value={parseTime(item.created || ' ')}/>
// //                                     <AccordionItem label="Tip caz" value={item.caseTypeName}/>
// //                                     <AccordionItem label="Nivel 1" value={item.caseIndex1Name}/>
// //                                     <AccordionItem label="Nivel 2" value={item.caseIndex2Name}/>
// //                                     <AccordionItem label="Telefon" value={item.phoneNumber}/>
// //                                     <AccordionItem label="Apelant" value={item.orderer ?? " - -"}/>
// //                                     <AccordionItem label="Address" value={item.address}/>
// //
// //                                     <Box sx={{gridColumn: "span 2"}}>
// //                                         <AccordionItem
// //                                             label="Comentarii caz"
// //                                             value={item.caseIndexComment || "Fără comentarii"}
// //                                         />
// //                                     </Box>
// //                                     <Box sx={{gridColumn: "span 2"}}>
// //                                         <AccordionItem
// //                                             label="Comentarii dosar"
// //                                             value={item.caseFolderIndexComment || "Fără comentarii"}
// //                                         />
// //                                     </Box>
// //                                 </Box>
// //
// //                                 {/* Loguri de activitate */}
// //                                 <Stack direction="column" spacing={2}>
// //                                     <Paper variant="outlined" sx={{p: 2, bgcolor: "#f8f9fa"}}>
// //                                         <Typography variant="subtitle2"
// //                                                     sx={{display: "flex", alignItems: "center", gap: 1}}>
// //                                             <ArticleIcon fontSize="small" color="action"/> Loguri Activitate
// //                                         </Typography>
// //                                         <Stack direction="row" justifyContent="space-between" alignItems="center"
// //                                                sx={{mb: 1}}>
// //                                             {!logs.data[caseFolderId] && (
// //                                                 <Button
// //                                                     fullWidth={true}
// //                                                     variant="contained"
// //                                                     color={"inherit"}
// //                                                     onClick={() => handleLogs(caseFolderId)}
// //                                                     disabled={logs.loading[caseFolderId]}
// //                                                 >
// //                                                     {logs.loading[caseFolderId] ? "Se încarcă..." : "Vezi Loguri"}
// //                                                 </Button>
// //                                             )}
// //                                         </Stack>
// //
// //                                         {logs.error[caseFolderId] && (
// //                                             <Stack direction="row" spacing={1} alignItems="center">
// //                                                 <Typography variant="caption" color="error">
// //                                                     {logs.error[caseFolderId]}
// //                                                 </Typography>
// //                                                 <Button size="small" onClick={() => handleLogs(caseFolderId)}>
// //                                                     Reîncearcă
// //                                                 </Button>
// //                                             </Stack>
// //                                         )}
// //
// //                                         {logs.data[caseFolderId] && (
// //                                             <Box
// //                                                 sx={{
// //                                                     mt: 1,
// //                                                     display: "flex",
// //                                                     flexDirection: "column",
// //                                                     gap: 0.5,
// //                                                     maxHeight: 250,
// //                                                     overflowY: "auto",
// //                                                     bgcolor: "#1e1e1e",
// //                                                     p: 1,
// //                                                     borderRadius: 1,
// //                                                     fontFamily: "monospace",
// //                                                 }}
// //                                             >
// //                                                 {logs.data[caseFolderId].length > 0 ? (
// //                                                     logs.data[caseFolderId].map((log: any, idx: number) => (
// //                                                         <Box
// //                                                             key={`${caseFolderId}-log-${idx}`}
// //                                                             sx={{
// //                                                                 display: "flex",
// //                                                                 alignItems: "baseline",
// //                                                                 gap: 1.5,
// //                                                                 py: 0.25,
// //                                                                 px: 0.5,
// //                                                                 borderBottom: "1px solid #333",
// //                                                                 "&:last-child": {borderBottom: "none"},
// //                                                                 "&:hover": {bgcolor: "#2a2a2a"},
// //                                                             }}
// //                                                         >
// //                                                             <Typography
// //                                                                 component="span"
// //                                                                 sx={{
// //                                                                     fontFamily: "monospace",
// //                                                                     fontSize: "0.72rem",
// //                                                                     color: "#4fc3f7",
// //                                                                     whiteSpace: "nowrap",
// //                                                                     flexShrink: 0,
// //                                                                 }}
// //                                                             >
// //
// //                                                                 {log.Created}
// //                                                             </Typography>
// //
// //                                                             <Typography
// //                                                                 component="span"
// //                                                                 sx={{
// //                                                                     fontFamily: "monospace",
// //                                                                     fontSize: "0.75rem",
// //                                                                     color: "#fff",
// //                                                                     wordBreak: "break-word",
// //                                                                 }}
// //                                                             >
// //                                                                 {log.LogText}
// //                                                             </Typography>
// //                                                         </Box>
// //                                                     ))
// //                                                 ) : (
// //                                                     <Typography variant="caption"
// //                                                                 sx={{color: "#aaa", fontFamily: "monospace"}}>
// //                                                         Nu există loguri.
// //                                                     </Typography>
// //                                                 )}
// //                                             </Box>
// //                                         )}
// //                                     </Paper>
// //                                 </Stack>
// //
// //                                 <Stack direction="column" spacing={2} sx={{mt: "16px"}}>
// //                                     {/* Localizare Operator */}
// //                                     <Paper variant="outlined" sx={{p: 2, bgcolor: "#fffaf0"}}>
// //                                         <Typography variant="subtitle2" gutterBottom
// //                                                     sx={{display: "flex", alignItems: "center", gap: 1}}>
// //                                             <LocationOnIcon fontSize="small" color="warning"/> Localizare Operator
// //                                         </Typography>
// //                                         <Button
// //                                             fullWidth
// //                                             variant="contained"
// //                                             color="warning"
// //                                             disabled={!item.xCoordinate || !item.yCoordinate}
// //                                             onClick={() =>
// //                                                 item.xCoordinate &&
// //                                                 item.yCoordinate &&
// //                                                 setPointOnMap({
// //                                                     XCoordinate: item.xCoordinate,
// //                                                     YCoordinate: item.yCoordinate,
// //                                                 })
// //                                             }
// //                                             sx={{textTransform: "none", borderRadius: 2}}
// //                                         >
// //                                             Setați coordonatele pe hartă
// //                                         </Button>
// //                                     </Paper>
// //
// //                                     {/* Înregistrări Audio */}
// //                                     <Paper
// //                                         variant="outlined"
// //                                         sx={{
// //                                             p: 2,
// //                                             bgcolor: "#f0f4f8",
// //                                             mt: 2,
// //                                             minHeight: "50px",
// //                                             maxHeight: "300px",
// //                                             overflow: audio.data[caseFolderId] ? "auto" : "hidden",
// //                                             transition: "min-height 0.2s ease",
// //                                         }}
// //                                     >
// //                                         <Typography variant="subtitle2" gutterBottom
// //                                                     sx={{display: "flex", alignItems: "center", gap: 1}}>
// //                                             <HistoryIcon fontSize="small" color="secondary"/> Înregistrări Apel
// //                                         </Typography>
// //
// //                                         {audio.error[caseFolderId] && (
// //                                             <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
// //                                                 <Typography variant="caption" color="error">
// //                                                     {audio.error[caseFolderId]}
// //                                                 </Typography>
// //                                                 <Button size="small" onClick={() => handleAudio(caseFolderId)}>
// //                                                     Reîncearcă
// //                                                 </Button>
// //                                             </Stack>
// //                                         )}
// //
// //                                         {!audio.data[caseFolderId] ? (
// //                                             <Button
// //                                                 fullWidth={true}
// //                                                 variant="contained"
// //                                                 color={"secondary"}
// //                                                 onClick={() => handleAudio(caseFolderId)}
// //                                                 disabled={audio.loading[caseFolderId]}
// //                                             >
// //                                                 {audio.loading[caseFolderId] ? "Se încarcă..." : "Încarcă Înregistrări"}
// //                                             </Button>
// //                                         ) : (
// //                                             <Stack spacing={1}>
// //                                                 {audio.data[caseFolderId].length > 0 ? (
// //                                                     audio.data[caseFolderId].map((file: any, index: number) => (
// //                                                         <AudioPlayerItem
// //                                                             key={`${caseFolderId}-audio-${index}`}
// //                                                             caseFolderId={caseFolderId}
// //                                                             file={file}
// //                                                             index={index}
// //                                                             onGlobalPlay={handlePlay}
// //                                                         />
// //                                                     ))
// //                                                 ) : (
// //                                                     <Typography variant="caption" color="text.secondary">
// //                                                         Nu s-au găsit înregistrări.
// //                                                     </Typography>
// //                                                 )}
// //                                             </Stack>
// //                                         )}
// //                                     </Paper>
// //
// //
// //                                     {/* Localizare SEQ */}
// //                                     <Paper variant="outlined" sx={{p: 2, bgcolor: "#f3f9f4"}}>
// //                                         <Typography
// //                                             variant="subtitle2"
// //                                             gutterBottom
// //                                             sx={{display: "flex", alignItems: "center", gap: 1}}
// //                                         >
// //                                             <TravelExploreIcon fontSize="small" color="success"/>
// //                                             Localizare SEQ
// //                                         </Typography>
// //
// //                                         <Button
// //                                             fullWidth
// //                                             variant="contained"
// //                                             color="success"
// //                                             disabled={!String(item.phoneNumber ?? "").trim() || seqLoading}
// //                                             onClick={() =>
// //                                                 handleSeqLocations(item.phoneNumber, item.caseFolderId)
// //                                             }
// //                                             sx={{textTransform: "none", borderRadius: 2}}
// //                                         >
// //                                             {seqLoading
// //                                                 ? "Se încarcă localizările..."
// //                                                 : seqSearched
// //                                                     ? "Caută din nou"
// //                                                     : "Încarcă localizări din SEQ"}
// //                                         </Button>
// //
// //                                         {seqLoading && (
// //                                             <Typography
// //                                                 variant="body2"
// //                                                 color="text.secondary"
// //                                                 sx={{mt: 1}}
// //                                             >
// //                                                 Se caută localizările asociate numărului de telefon...
// //                                             </Typography>
// //                                         )}
// //
// //                                         {!seqLoading && seqError && (
// //                                             <Stack spacing={1} sx={{mt: 1}}>
// //                                                 <Typography variant="body2" color="error">
// //                                                     {seqError}
// //                                                 </Typography>
// //
// //                                                 <Button
// //                                                     size="small"
// //                                                     onClick={() =>
// //                                                         handleSeqLocations(item.phoneNumber!, item.caseFolderId!)
// //                                                     }
// //                                                 >
// //                                                     Reîncearcă
// //                                                 </Button>
// //                                             </Stack>
// //                                         )}
// //
// //                                         {!seqLoading &&
// //                                             !seqError &&
// //                                             seqSearched &&
// //                                             (seqResults?.length ?? 0) === 0 && (
// //                                                 <Typography
// //                                                     variant="body2"
// //                                                     color="text.secondary"
// //                                                     sx={{mt: 1}}
// //                                                 >
// //                                                     Nu s-au găsit localizări în SEQ pentru acest număr.
// //                                                 </Typography>
// //                                             )}
// //
// //                                         {!seqLoading &&
// //                                             !seqError &&
// //                                             (seqResults?.length ?? 0) > 0 && (
// //                                                 <Stack spacing={1} sx={{mt: 2}}>
// //                                                     {seqResults.map((location, index) => (
// //                                                         <Button
// //                                                             key={`${caseFolderId}-seq-${location.kind}-${location.timeUtc}-${index}`}
// //                                                             fullWidth
// //                                                             variant="outlined"
// //                                                             onClick={() => {
// //                                                                 setSelectedSeqIdx(index);
// //                                                                 showSeqOnMap(index, location);
// //                                                             }}
// //                                                             sx={{
// //                                                                 textTransform: "none",
// //                                                                 justifyContent: "center",
// //                                                                 textAlign: "center",
// //                                                                 borderRadius: 1,
// //                                                                 py: 1,
// //                                                                 color: "#2e7d32",
// //                                                                 borderColor:
// //                                                                     selectedSeqIdx === index ? "#2e7d32" : "#81c784",
// //                                                                 bgcolor:
// //                                                                     selectedSeqIdx === index
// //                                                                         ? "rgba(46, 125, 50, 0.10)"
// //                                                                         : "transparent",
// //                                                                 "&:hover": {
// //                                                                     bgcolor: "rgba(46, 125, 50, 0.08)",
// //                                                                     borderColor: "#2e7d32",
// //                                                                 },
// //                                                             }}
// //                                                         >
// //                                                             {`${location.kind} | ${new Date(
// //                                                                 location.timeUtc
// //                                                             ).toLocaleString("ro-RO", {
// //                                                                 day: "2-digit",
// //                                                                 month: "long",
// //                                                                 year: "numeric",
// //                                                                 hour: "2-digit",
// //                                                                 minute: "2-digit",
// //                                                             })}`}
// //                                                         </Button>
// //                                                     ))}
// //                                                 </Stack>
// //                                             )}
// //
// //                                     </Paper>
// //
// //
// //                                     {/* Istoric Locații AML/MLP */}
// //                                     <Paper variant="outlined" sx={{p: 2, bgcolor: "#f5faff"}}>
// //                                         <Stack direction="row" justifyContent="space-between" alignItems="center">
// //                                             <Typography variant="subtitle2" gutterBottom
// //                                                         sx={{display: "flex", alignItems: "center", gap: 1}}>
// //                                                 <HistoryIcon fontSize="small" color="primary"/> Istoric Locații
// //                                                 (AML/MLP)
// //                                             </Typography>
// //                                         </Stack>
// //
// //                                         {geom.error[caseFolderId] && (
// //                                             <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
// //                                                 <Typography variant="caption" color="error">
// //                                                     {geom.error[caseFolderId]}
// //                                                 </Typography>
// //                                                 <Button size="small" onClick={() => handleAML(caseFolderId)}>
// //                                                     Reîncearcă
// //                                                 </Button>
// //                                             </Stack>
// //                                         )}
// //
// //                                         {geom.loading[caseFolderId] && (
// //                                             <Typography variant="caption" color="text.secondary">
// //                                                 Se încarcă locațiile...
// //                                             </Typography>
// //                                         )}
// //
// //                                         {geom.data[caseFolderId]?.length > 0 ? (
// //                                             <Box
// //                                                 sx={{
// //                                                     display: "flex",
// //                                                     flexWrap: "wrap",
// //                                                     gap: 1,
// //                                                     justifyContent: "center"
// //                                                 }}
// //                                             >
// //                                                 {geom.data[caseFolderId].map((g: any, n: number) => (
// //                                                     <Button
// //                                                         key={`${caseFolderId}-geom-${n}`}
// //                                                         fullWidth
// //                                                         variant={selectedIdx[caseFolderId] === n ? "contained" : "outlined"}
// //                                                         color={selectedIdx[caseFolderId] === n ? "primary" : "info"}
// //                                                         onClick={() => {
// //                                                             addUniqueGeometries([{
// //                                                                 features: g.geometry.feature,
// //                                                                 type: g.geometry.type
// //                                                             }]);
// //                                                             setSelectedIdx((prev: any) => ({
// //                                                                 ...prev,
// //                                                                 [caseFolderId]: n
// //                                                             }));
// //                                                         }}
// //                                                         sx={{
// //                                                             justifyContent: "flex-center",
// //                                                             textTransform: "none",
// //                                                             mb: 1
// //                                                         }}
// //                                                     >
// //                                                         {`${g.geometry.type} | ${parseTime(g.created)}`}
// //                                                     </Button>
// //                                                 ))}
// //                                             </Box>
// //                                         ) : (
// //                                             !geom.loading[caseFolderId] &&
// //                                             !geom.error[caseFolderId] && (
// //                                                 <Typography variant="caption" color="text.secondary">
// //                                                     Nu s-au găsit date de localizare automată.
// //                                                 </Typography>
// //                                             )
// //                                         )}
// //                                     </Paper>
// //                                 </Stack>
// //                             </AccordionDetails>
// //                         </Accordion>
// //                     );
// //                 })
// //             ) : (
// //                 <Paper sx={{p: 3, textAlign: "center", bgcolor: "#fdfdfd"}}>
// //                     <Typography color="text.secondary">Niciun rezultat.</Typography>
// //                 </Paper>
// //             )}
// //         </Box>
// //     );
// // };