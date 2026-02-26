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
import {type StoredGeometry, useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import {useGetGeomByCasefolderid} from "../../connect/get-geom-by-casefolderid.ts";
import {parseMobilePosition} from "../../utils/shapeXmlToGeoJSON.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {parseTime} from "../../utils/parse-time.ts";
import {getSsuIconType} from "../../utils/parse-ssu-icon.ts";
import Doc from "../../assets/doc.png";

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
}

export const AccordionComponent = ({data}: Props) => {
    const items = Array.isArray(data) ? data : [data];
    const [geomById, setGeomById] = useState<Record<number, any[]>>({});
    const setPointOnMap = useStoreAddPointOnMap((s) => s.setCoordinate);
    const resetPointOnMap = useStoreAddPointOnMap((s) => s.resetCoordinates);
    const resetFeatures = useStoreGeometryFromCaseFolderId((s) => s.resetSelectedFeature);
    const {fetchGeom} = useGetGeomByCasefolderid();
    const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({});
    const addUniqueGeoemetries = useStoreGeometryFromCaseFolderId((state) => state.addUniqueFeature);
    const [expandedId, setExpandedId] = useState<number | null>(null);

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

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, p: 1}}>
            {items.map((item) => (
                <Accordion
                    key={item.caseFolderId}
                    expanded={expandedId === item.caseFolderId}
                    onChange={(_, expanded) => {
                        setExpandedId(expanded ? item.caseFolderId : null);
                        if (expanded) handleAML(item.caseFolderId);
                    }}
                    sx={{
                        borderRadius: '8px !important',
                        '&:before': {display: 'none'}, // scoate linia default de sus
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <img src={Doc} style={{width: 24, height: 24}} alt="doc"/>
                            <Typography sx={{fontWeight: 'bold', minWidth: '80px'}}>
                                #{item.caseFolderId}
                            </Typography>
                            <Divider orientation="vertical" flexItem/>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <img src={getSsuIconType(item.caseTypeId)} style={{width: 28, height: 28}} alt="type"/>
                                <Typography variant="body2" color="text.secondary">Tip: {item.caseTypeId}</Typography>
                            </Box>
                        </Stack>
                    </AccordionSummary>

                    <AccordionDetails sx={{pt: 0, px: 3, pb: 3}}>
                        <Divider sx={{mb: 2}}/>

                        {/* Secțiunea de detalii sub formă de grid */}
                        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3}}>
                            <AccordionItem label="Creator" value={item.creator}/>
                            <AccordionItem label="Tip caz" value={item.caseTypeName}/>
                            <AccordionItem label="Nivel 1" value={item.caseIndex1Name}/>
                            <AccordionItem label="Nivel 2" value={item.caseIndex2Name}/>
                            <Box sx={{gridColumn: 'span 2'}}>
                                <AccordionItem label="Fabulă" value={item.caseIndexComment || "Fără comentarii"}/>
                            </Box>
                        </Box>

                        <Stack direction="column" spacing={2}>
                            {/* Localizare Operator */}
                            <Paper variant="outlined" sx={{p: 2, bgcolor: '#fffaf0'}}>
                                <Typography variant="subtitle2" gutterBottom
                                            sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <LocationOnIcon fontSize="small" color="warning"/> Localizare Operator
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="warning"
                                    disabled={!item.XCoordinate}
                                    onClick={() => item.XCoordinate && item.YCoordinate && setPointOnMap({
                                        XCoordinate: item.XCoordinate,
                                        YCoordinate: item.YCoordinate
                                    })}
                                    sx={{textTransform: 'none', borderRadius: 2}}
                                >
                                    Setați coordonatele pe hartă
                                </Button>
                            </Paper>

                            {/* Istoric AML/MLP */}
                            <Paper variant="outlined" sx={{p: 2, bgcolor: '#f5faff'}}>
                                <Typography variant="subtitle2" gutterBottom
                                            sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                    <HistoryIcon fontSize="small" color="primary"/> Istoric Locații (AML/MLP)
                                </Typography>

                                {geomById[item.caseFolderId]?.length > 0 ? (
                                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                        {geomById[item.caseFolderId].map((g, n) => (
                                            <Chip
                                                key={n}
                                                label={`${g.geometry.type} | ${parseTime(g.created)}`}
                                                clickable
                                                color={selectedIdx[item.caseFolderId] === n ? "primary" : "default"}
                                                onClick={() => {
                                                    addUniqueGeoemetries([{
                                                        features: g.geometry.feature,
                                                        type: g.geometry.type
                                                    }]);
                                                    setSelectedIdx(prev => ({...prev, [item.caseFolderId]: n}));
                                                }}
                                                variant={selectedIdx[item.caseFolderId] === n ? "filled" : "outlined"}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">Nu s-au găsit date de
                                        localizare automată.</Typography>
                                )}
                            </Paper>
                        </Stack>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};
