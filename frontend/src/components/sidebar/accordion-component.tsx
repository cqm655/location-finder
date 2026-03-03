import {useState} from "react";
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

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
}

/**
 * Componenta principală care randează lista de cazuri sub formă de acordeoane.
 * Include logici pentru filtrare, preluare geometrie (AML/MLP) și loguri de activitate.
 */
export const AccordionComponent = ({data}: Props) => {
    // Transformă datele în array dacă vin ca obiect singular pentru a asigura consistența la mapare
    const items = Array.isArray(data) ? data : [data];

    // Hook pentru starea filtrelor de organizație (Ambulanță, Poliție, Pompieri)
    const {selectedOrgs} = useStoreCaseTypeName();

    // Stări locale pentru gestionarea datelor preluate asincron pentru fiecare caz în parte
    const [geomById, setGeomById] = useState<Record<number, GeometryWithDate[]>>({}); // Geometria per ID caz
    const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({}); // Indexul chip-ului de locație selectat
    const [expandedId, setExpandedId] = useState<number | null>(null); // ID-ul acordeonului deschis momentan
    const [logsById, setLogsById] = useState<Record<number, any[]>>({}); // Logurile de activitate per ID caz
    const [loadingLogs, setLoadingLogs] = useState<Record<number, boolean>>({}); // Starea de loading pentru loguri

    // Hook-uri din store-uri globale pentru interacțiunea cu harta
    const setPointOnMap = useStoreAddPointOnMap((s) => s.setCoordinate);
    const resetPointOnMap = useStoreAddPointOnMap((s) => s.resetCoordinates);
    const resetFeatures = useStoreGeometryFromCaseFolderId((s) => s.resetSelectedFeature);
    const addUniqueGeoemetries = useStoreGeometryFromCaseFolderId((state) => state.addUniqueFeature);

    // Hook-uri pentru apeluri API
    const {fetchGeom} = useGetGeomByCasefolderid();
    const {fetchLogs} = useGetLogsByCasefolderId();

    /**
     * Filtrează lista de cazuri în funcție de organizațiile selectate în MapControls.
     * Dacă nu este selectat niciun filtru, se afișează toate cazurile.
     */
    const filteredItems = items.filter(item => {
        const typeName = item.caseTypeName?.toLowerCase() || "";

        // Verifică dacă utilizatorul a debifat toate opțiunile
        const noFilterSelected = !selectedOrgs['Ambulanță'] &&
            !selectedOrgs['Poliție'] &&
            !selectedOrgs['Pompieri'];

        if (noFilterSelected) return true; // Afișăm tot dacă nu există filtre active

        // Logică de potrivire a textului pentru fiecare departament
        const matchAmbulance = selectedOrgs['Ambulanță'] && (typeName.includes('ambulan') || typeName.includes('903'));
        const matchPolice = selectedOrgs['Poliție'] && (typeName.includes('poli') || typeName.includes('902') || typeName.includes('igp'));
        const matchFire = selectedOrgs['Pompieri'] && (typeName.includes('pompier') || typeName.includes('901') || typeName.includes('dse'));

        return matchAmbulance || matchPolice || matchFire;
    });

    /**
     * Preia datele de localizare (geometria) pentru un caz specific.
     * Filtrează rezultatele pentru a păstra doar tipurile AML și MLP valide.
     * @param id - ID-ul folderului de caz (CaseFolderId)
     */
    const handleAML = async (id: number) => {
        if (geomById[id]) return; // Evită apelul API dacă datele există deja în cache-ul local

        resetFeatures(); // Curăță hărțile de geometrii anterioare
        resetPointOnMap();

        const resp = await fetchGeom(id);
        const geometry = resp
            ?.map(item => ({
                geometry: parseMobilePosition(item.geometry),
                created: item.Created,
            }))
            .filter(g => g.geometry.type === 'AML' || g.geometry.type === 'MLP')
            .filter(g => g.geometry.feature?.features?.length > 0) ?? [];

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
                    const caseId = item.caseFolderId;
                    if (caseId === undefined) return null;

                    return (
                        <Accordion
                            key={caseId}
                            expanded={expandedId === caseId}
                            onChange={(_, expanded) => {
                                setExpandedId(expanded ? caseId : null);
                                // Când se deschide un acordeon, încercăm să aducem automat localizarea
                                if (expanded) handleAML(caseId);
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
                                        #{caseId}
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

                                    {/* Secțiune Loguri: Permite încărcarea și vizualizarea logurilor */}
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: '#f8f9fa', gridColumn: 'span 2'}}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center"
                                               sx={{mb: 1}}>
                                            <Typography variant="subtitle2"
                                                        sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                <ArticleIcon fontSize="small" color="action"/> Loguri Activitate
                                            </Typography>
                                            {!logsById[caseId] && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleLogs(caseId)}
                                                    disabled={loadingLogs[caseId]}
                                                >
                                                    {loadingLogs[caseId] ? "Se încarcă..." : "Vezi Loguri"}
                                                </Button>
                                            )}
                                        </Stack>

                                        {/* Listare loguri dacă sunt încărcate */}
                                        {logsById[caseId] && (
                                            <Box sx={{
                                                mt: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 1,
                                                maxHeight: 300,
                                                overflowY: 'auto'
                                            }}>
                                                {logsById[caseId].length > 0 ? (
                                                    logsById[caseId].map((log, idx) => (
                                                        <Box key={idx} sx={{
                                                            p: 1,
                                                            bgcolor: 'white',
                                                            borderRadius: 1,
                                                            borderLeft: '3px solid #0288d1',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                        }}>
                                                            <Typography variant="caption" color="text.secondary"
                                                                        display="block">
                                                                {parseTime(log.Created)} - <strong>{log.Creator.trim()}</strong>
                                                            </Typography>
                                                            <Typography variant="body2" sx={{fontSize: '0.85rem'}}>
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
                                        <AccordionItem label="Fabulă"
                                                       value={item.caseIndexComment || "Fără comentarii"}/>
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
                                            disabled={!item.XCoordinate || !item.YCoordinate}
                                            onClick={() => item.XCoordinate && item.YCoordinate && setPointOnMap({
                                                XCoordinate: item.XCoordinate,
                                                YCoordinate: item.YCoordinate
                                            })}
                                            sx={{textTransform: 'none', borderRadius: 2}}
                                        >
                                            Setați coordonatele pe hartă
                                        </Button>
                                    </Paper>

                                    {/* Chip-uri pentru selecția locațiilor automate (AML/MLP) */}
                                    <Paper variant="outlined" sx={{p: 2, bgcolor: '#f5faff'}}>
                                        <Typography variant="subtitle2" gutterBottom
                                                    sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <HistoryIcon fontSize="small" color="primary"/> Istoric Locații (AML/MLP)
                                        </Typography>

                                        {geomById[caseId]?.length > 0 ? (
                                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                                {geomById[caseId].map((g, n) => (
                                                    <Chip
                                                        key={n}
                                                        label={`${g.geometry.type} | ${parseTime(g.created)}`}
                                                        clickable
                                                        color={selectedIdx[caseId] === n ? "primary" : "default"}
                                                        onClick={() => {
                                                            addUniqueGeoemetries([{
                                                                features: g.geometry.feature,
                                                                type: g.geometry.type
                                                            }]);
                                                            setSelectedIdx(prev => ({...prev, [caseId]: n}));
                                                        }}
                                                        variant={selectedIdx[caseId] === n ? "filled" : "outlined"}
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
                /* Mesaj afișat când filtrele ascund toate elementele */
                <Paper sx={{p: 3, textAlign: 'center', bgcolor: '#fdfdfd'}}>
                    <Typography color="text.secondary">
                        Niciun rezultat conform filtrelor de organizație selectate.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};
