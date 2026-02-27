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

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
}

export const AccordionComponent = ({data}: Props) => {
    const items = Array.isArray(data) ? data : [data];
    const [geomById, setGeomById] = useState<Record<number, GeometryWithDate[]>>({});
    const setPointOnMap = useStoreAddPointOnMap((s) => s.setCoordinate);
    const resetPointOnMap = useStoreAddPointOnMap((s) => s.resetCoordinates);
    const resetFeatures = useStoreGeometryFromCaseFolderId((s) => s.resetSelectedFeature);
    const {fetchGeom} = useGetGeomByCasefolderid();
    const {fetchLogs} = useGetLogsByCasefolderId();
    const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({});
    const addUniqueGeoemetries = useStoreGeometryFromCaseFolderId((state) => state.addUniqueFeature);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [logsById, setLogsById] = useState<Record<number, any[]>>({});
    const [loadingLogs, setLoadingLogs] = useState<Record<number, boolean>>({});

    const handleAML = async (id: number) => {
        if (geomById[id]) return;
        resetFeatures();
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

    const handleLogs = async (id: number) => {
        if (logsById[id]) return; // Nu mai descărca dacă le avem deja

        setLoadingLogs(prev => ({...prev, [id]: true}));
        try {
            const resp = await fetchLogs(id);
            console.log(resp)
            setLogsById(prev => ({...prev, [id]: resp}));
        } catch (error) {
            console.error("Eroare la loguri:", error);
        } finally {
            setLoadingLogs(prev => ({...prev, [id]: false}));
        }
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, p: 1}}>
            {items.map((item) => {
                // 1. Extrage ID-ul și oferă un fallback pentru cheia React (index)
                // sau sari peste item dacă ID-ul e critic
                const caseId = item.caseFolderId;
                if (caseId === undefined) return null;

                return (
                    <Accordion
                        key={caseId} // Acum e sigur 'number'
                        expanded={expandedId === caseId}
                        onChange={(_, expanded) => {
                            setExpandedId(expanded ? caseId : null);
                            if (expanded) handleAML(caseId);
                        }}
                        sx={{
                            borderRadius: '8px !important',
                            '&:before': {display: 'none'},
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <img src={Doc} style={{width: 24, height: 24}} alt="doc"/>
                                <Typography sx={{fontWeight: 'bold', minWidth: '80px'}}>
                                    #{caseId}
                                </Typography>
                                <Divider orientation="vertical" flexItem/>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    {/* Folosim caseTypeId cu fallback dacă e opțional */}
                                    <img src={getSsuIconType(item.caseTypeId ?? 0)} style={{width: 28, height: 28}}
                                         alt="type"/>
                                </Box>
                            </Stack>
                        </AccordionSummary>

                        <AccordionDetails sx={{pt: 0, px: 3, pb: 3}}>
                            <Divider sx={{mb: 2}}/>

                            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3}}>
                                <AccordionItem label="Creator" value={item.creator}/>
                                <AccordionItem label="Tip caz" value={item.caseTypeName}/>
                                <AccordionItem label="Nivel 1" value={item.caseIndex1Name}/>
                                <AccordionItem label="Nivel 2" value={item.caseIndex2Name}/>
                                <AccordionItem label="Telefon" value={item.phoneNumber}/>
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
                                                <Typography variant="caption" color="text.secondary">Nu există loguri
                                                    pentru acest caz.</Typography>
                                            )}
                                        </Box>
                                    )}
                                </Paper>
                                <Box sx={{gridColumn: 'span 2'}}>
                                    <AccordionItem label="Fabulă" value={item.caseIndexComment || "Fără comentarii"}/>
                                </Box>
                            </Box>

                            <Stack direction="column" spacing={2}>
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

                                <Paper variant="outlined" sx={{p: 2, bgcolor: '#f5faff'}}>
                                    <Typography variant="subtitle2" gutterBottom
                                                sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                        <HistoryIcon fontSize="small" color="primary"/> Istoric Locații (AML/MLP)
                                    </Typography>

                                    {/* Folosim caseId care este garantat number aici */}
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
            })}
        </Box>
    );
};
