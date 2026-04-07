import {useState, useRef} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Button, Typography, Box, Divider, Stack, Chip, Paper
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HistoryIcon from "@mui/icons-material/History";
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
import ArticleIcon from '@mui/icons-material/Article';

// --- IMPORTĂ STORE-UL DE FILTRARE ---
import {useStoreCaseTypeName} from "../../store/useStoreCaseTypeName.ts";

const soundPath = import.meta.env.VITE_SOUND_PATH

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
    disableFilter?: boolean;
}

/**
 * Componenta principală care randează lista de cazuri sub formă de acordeoane.
 * Include logici pentru filtrare, preluare geometrie (AML/MLP) și loguri de activitate.
 */
export const AccordionComponent = ({data, disableFilter = false}: Props) => {
    // Transformă datele în array dacă vin ca obiect singular pentru a asigura consistența la mapare
    const item = Array.isArray(data) ? data : [data];
    // Hook pentru starea filtrelor de organizație (Ambulanță, Poliție, Pompieri)
    const {selectedOrgs} = useStoreCaseTypeName();

    // Stări locale pentru gestionarea datelor preluate asincron pentru fiecare caz în parte
    const [geomById, setGeomById] = useState<Record<number, GeometryWithDate[]>>({}); // Geometria per ID caz
    const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({}); // Indexul chip-ului de locație selectat
    const [expandedId, setExpandedId] = useState<number | null>(null); // ID-ul acordeonului deschis momentan
    const [logsById, setLogsById] = useState<Record<number, any[]>>({}); // Logurile de activitate per ID caz
    const [loadingLogs, setLoadingLogs] = useState<Record<number, boolean>>({}); // Starea de loading pentru loguri

    // Audio player
    const [audioById, setAudioById] = useState<Record<number, any[]>>({});
    const [loadingAudio, setLoadingAudio] = useState<Record<number, boolean>>({});
    const currentlyPlayingRef = useRef<HTMLAudioElement | null>(null);

    // Hook-uri din store-uri globale pentru interacțiunea cu harta
    const setPointOnMap = useStoreAddPointOnMap((s) => s.setCoordinate);
    const resetPointOnMap = useStoreAddPointOnMap((s) => s.resetCoordinates);
    const resetFeatures = useStoreGeometryFromCaseFolderId((s) => s.resetSelectedFeature);
    const addUniqueGeoemetries = useStoreGeometryFromCaseFolderId((state) => state.addUniqueFeature);

    // Hook-uri pentru apeluri API
    const {fetchGeom} = useGetGeomByCasefolderid();
    const {fetchLogs} = useGetLogsByCasefolderId();


    /**
     * Player Audio
     */
    const handlePlay = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        const audioElement = e.currentTarget;

        // Dacă există deja ceva care cântă și nu este player-ul curent
        if (currentlyPlayingRef.current && currentlyPlayingRef.current !== audioElement) {
            currentlyPlayingRef.current.pause(); // Oprim player-ul vechi
            // currentlyPlayingRef.current.currentTime = 0; // Opțional: resetează la început
        }

        // Actualizăm referința cu player-ul nou
        currentlyPlayingRef.current = audioElement;
    };

    const handleAudio = async (id: number) => {
        if (audioById[id]) return; // Nu reîncărcăm dacă există deja

        setLoadingAudio(prev => ({...prev, [id]: true}));
        try {
            // Presupunem că ai un hook/metodă similară cu fetchLogs
            const resp = await fetch(`${soundPath}/audio/list/${id}`).then(res => res.json());
            setAudioById(prev => ({...prev, [id]: resp}));
        } catch (error) {
            console.error("Eroare la preluarea listei audio:", error);
        } finally {
            setLoadingAudio(prev => ({...prev, [id]: false}));
        }
    };

    /**
     * Filtrează lista de cazuri în funcție de organizațiile selectate în MapControls.
     * Dacă nu este selectat niciun filtru, se afișează toate cazurile.
     */

    const filteredItems = disableFilter ? item : item.filter(itm => {
        const typeName = itm.caseTypeName?.toLowerCase() || "";

        const ambulance = selectedOrgs['Ambulanță'] ?? false;
        const police = selectedOrgs['Poliție'] ?? false;
        const fire = selectedOrgs['Pompieri'] ?? false;

        const noFilterSelected = !ambulance && !police && !fire;
        if (noFilterSelected) return true;

        const matchAmbulance = ambulance && (typeName.includes('ambulan') || typeName.includes('903'));
        const matchPolice = police && (typeName.includes('poli') || typeName.includes('902') || typeName.includes('igp'));
        const matchFire = fire && (typeName.includes('pompier') || typeName.includes('901') || typeName.includes('dse'));

        return matchAmbulance || matchPolice || matchFire;
    });

    /**
     * Preia datele de localizare (geometria) pentru un caz specific.
     * Filtrează rezultatele pentru a păstra doar tipurile AML și MLP valide.
     * @param id - ID-ul folderului de caz (CaseFolderId)
     */
    const handleAML = async (id: number) => {
        if (geomById[id]) return;

        resetFeatures(); // Curăță hărțile de geometrii anterioare
        resetPointOnMap();

        const resp = await fetchGeom(id);
        if (!Array.isArray(resp)) return;

        const geometry = resp
            .map(item => {
                const parsed = parseMobilePosition(item.MobilePosition || item.geometry);
                if (!parsed) return null;

                return {
                    geometry: parsed, // Conține type, feature și TIME
                    created: parsed.time, // Timpul extras direct de parser!
                };
            })
            .filter((item): item is GeometryWithDate => item !== null);

        setGeomById(prev => ({...prev, [id]: geometry}));
    };
    /**
     * Preia logurile de activitate pentru un caz specific de la server.
     * @param id - ID-ul folderului de caz
     */
    const handleLogs = async (id: number) => {
        if (logsById[id]) return; // Nu reîncărcăm dacă logurile au fost deja preluate

        setLoadingLogs(prev => ({...prev, [id]: true}));
        try {
            const resp = await fetchLogs(id);
            const logsArray = Array.isArray(resp) ? resp : [];
            setLogsById(prev => ({...prev, [id]: logsArray}));
        } catch (error) {
            console.error("Eroare la preluarea logurilor:", error);
        } finally {
            setLoadingLogs(prev => ({...prev, [id]: false}));
        }
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, p: 1}}>
            {/* Iterăm prin lista filtrată pentru a genera acordeoanele */}
            {filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                    const caseFolderId = item.caseFolderId ?? (item as any).CaseFolderId;
                    const caseId = item.caseId;

                    const uniqueRowKey = `${caseFolderId}-${caseId}`;

                    if (caseFolderId === undefined) return null;

                    return (
                        <Accordion
                            key={uniqueRowKey}
                            expanded={expandedId === uniqueRowKey}
                            onChange={(_, expanded) => {
                                setExpandedId(expanded ? uniqueRowKey : null);
                                // Când se deschide un acordeon, încercăm să aducem automat localizarea
                                if (expanded) handleAML(caseFolderId);
                            }}
                            sx={{
                                borderRadius: '8px !important',
                                '&:before': {display: 'none'},
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Antetul Acordeonului: ID, Iconiță Tip și Buton Expand */}
                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <img src={Doc} style={{width: 24, height: 24}} alt="doc"/>
                                    <Typography sx={{fontWeight: 'bold', minWidth: '80px'}}>
                                        #{caseFolderId}
                                    </Typography>
                                    <Divider orientation="vertical" flexItem/>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <img src={getSsuIconType(item.caseTypeId ?? 0)} style={{width: 28, height: 28}}
                                             alt="type"/>
                                    </Box>
                                </Stack>
                            </AccordionSummary>

                            {/* Detaliile Acordeonului: Informații dosar, Loguri și Locații */}
                            <AccordionDetails sx={{pt: 0, px: 3, pb: 3}}>
                                <Divider sx={{mb: 2}}/>

                                {/* Grid de informații de bază */}
                                <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3}}>
                                    <AccordionItem label="Creator" value={item.creator}/>
                                    <AccordionItem label="Tip caz" value={item.caseTypeName}/>
                                    <AccordionItem label="Nivel 1" value={item.caseIndex1Name}/>
                                    <AccordionItem label="Nivel 2" value={item.caseIndex2Name}/>
                                    <AccordionItem label="Telefon" value={item.phoneNumber}/>
                                    <AccordionItem label="Apelant" value={item.orderer}/>
                                    <AccordionItem label="Address" value={item.address}/>

                                    {/* Secțiune Loguri: Permite încărcarea și vizualizarea logurilor */}
                                    <Paper variant="outlined" sx={{p: 1, bgcolor: '#f8f9fa', gridColumn: 'span 2'}}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center"
                                               sx={{mb: 1}}>
                                            <Typography variant="subtitle2"
                                                        sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <ArticleIcon fontSize="small" color="action"/> Loguri Activitate
                                            </Typography>
                                            {!logsById[caseFolderId] && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleLogs(caseFolderId)}
                                                    disabled={loadingLogs[caseFolderId]}
                                                >
                                                    {loadingLogs[caseFolderId] ? "Se încarcă..." : "Vezi Loguri"}
                                                </Button>
                                            )}
                                        </Stack>

                                        {/* Listare loguri dacă sunt încărcate */}
                                        {logsById[caseFolderId] && (
                                            <Box sx={{
                                                mt: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                maxHeight: 300,
                                                overflowY: 'auto'
                                            }}>
                                                {logsById[caseFolderId].length > 0 ? (
                                                    logsById[caseFolderId].map((log, idx) => (
                                                        <Box key={idx} sx={{
                                                            pl: 1,
                                                            bgcolor: 'white',
                                                            borderRadius: 1,
                                                            borderLeft: '3px solid #0288d1',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                        }}>
                                                            <Typography variant="caption" color="info"
                                                                        display="block">
                                                                <strong> {parseTime(log.Created)}</strong>
                                                            </Typography>
                                                            <Typography variant="h6" sx={{fontSize: '0.7rem'}}>
                                                                {log.LogText}
                                                            </Typography>
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">Nu există
                                                        loguri.</Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Paper>

                                    <Box sx={{gridColumn: 'span 2'}}>
                                        <AccordionItem label="Comentarii caz"
                                                       value={item.caseIndexComment || "Fără comentarii"}/>
                                    </Box>
                                    <Box sx={{gridColumn: 'span 2'}}>
                                        <AccordionItem label="Comentarii dosar"
                                                       value={item.caseFolderIndexComment || "Fără comentarii"}/>
                                    </Box>
                                </Box>

                                {/* Acțiuni Harta: Coordonate Operator și Istoric Mobile (AML) */}
                                <Stack direction="column" spacing={2}>
                                    {/* Setează punctul definit manual de operator */}
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: '#fffaf0'}}>
                                        <Typography variant="subtitle2" gutterBottom
                                                    sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <LocationOnIcon fontSize="small" color="warning"/> Localizare Operator
                                        </Typography>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="warning"
                                            disabled={!item.xCoordinate || !item.yCoordinate}
                                            onClick={() => item.xCoordinate && item.yCoordinate && setPointOnMap({
                                                XCoordinate: item.xCoordinate,
                                                YCoordinate: item.yCoordinate
                                            })}
                                            sx={{textTransform: 'none', borderRadius: 2}}
                                        >
                                            Setați coordonatele pe hartă
                                        </Button>
                                    </Paper>
                                    {/* Secțiune Înregistrări Audio */}
                                    <Paper variant="outlined"
                                           sx={{
                                               p: 2,
                                               bgcolor: '#f0f4f8',
                                               mt: 2,
                                               height: !audioById[caseFolderId] ? "50px" : "100%",
                                               maxHeight: "300px",
                                               overflow: audioById[caseFolderId] ? "scroll" : "hidden"
                                           }}>
                                        <Typography variant="subtitle2" gutterBottom
                                                    sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <HistoryIcon fontSize="small" color="secondary"/> Înregistrări Apel
                                        </Typography>

                                        {!audioById[caseFolderId] ? (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => handleAudio(caseFolderId)}
                                                disabled={loadingAudio[caseFolderId]}
                                            >
                                                {loadingAudio[caseFolderId] ? "Se încarcă..." : "Încarcă Înregistrări"}
                                            </Button>
                                        ) : (
                                            <Stack spacing={1}>
                                                {audioById[caseFolderId].length > 0 ? (
                                                    audioById[caseFolderId].map((file, index) => (
                                                        <Box key={index}
                                                             sx={{
                                                                 display: 'flex',
                                                                 flexDirection: 'column',
                                                                 gap: 0.5
                                                             }}>
                                                            <Typography variant="caption">
                                                                Înregistrare
                                                                #{index + 1} - {file.OperatorName || 'Audio'}
                                                            </Typography>
                                                            <audio
                                                                controls
                                                                preload="none"
                                                                style={{width: '100%', height: '35px'}}
                                                                onPlay={handlePlay}
                                                            >
                                                                <source
                                                                    src={`${soundPath}/audio/stream/${caseFolderId}/${index}`}
                                                                    type="audio/mpeg"
                                                                />
                                                            </audio>
                                                        </Box>
                                                    ))
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Nu s-au găsit înregistrări.
                                                    </Typography>
                                                )}
                                            </Stack>
                                        )}


                                    </Paper>
                                    {/* Chip-uri pentru selecția locațiilor automate (AML/MLP) */}
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: '#f5faff'}}>
                                        <Typography variant="subtitle2" gutterBottom
                                                    sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <HistoryIcon fontSize="small" color="primary"/> Istoric Locații (AML/MLP)
                                        </Typography>

                                        {geomById[caseFolderId]?.length > 0 ? (
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                                {geomById[caseFolderId].map((g, n) => (
                                                    <Chip
                                                        key={n}
                                                        label={`${g.geometry.type} | ${parseTime(g.created)}`}
                                                        clickable
                                                        color={selectedIdx[caseFolderId] === n ? "primary" : "default"}
                                                        onClick={() => {
                                                            addUniqueGeoemetries([{
                                                                features: g.geometry.feature,
                                                                type: g.geometry.type
                                                            }]);
                                                            setSelectedIdx(prev => ({...prev, [caseFolderId]: n}));
                                                        }}
                                                        variant={selectedIdx[caseFolderId] === n ? "filled" : "outlined"}
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">
                                                Nu s-au găsit date de localizare automată.
                                            </Typography>
                                        )}
                                    </Paper>

                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    );
                })
            ) : (
                /* 1. Acest mesaj apare corect DOAR când filteredItems este gol */
                <Paper sx={{p: 3, textAlign: 'center', bgcolor: '#fdfdfd'}}>
                    <Typography color="text.secondary">
                        Niciun rezultat.
                    </Typography>
                </Paper>
            )}

        </Box>
    );
};
