import {useState} from "react";
import {
    Accordion, AccordionDetails, AccordionSummary,
    Button, Typography
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {AccordionItem} from "./Accordion-item.tsx";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import {type StoredGeometry, useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import {useGetGeomByCasefolderid} from "../../connect/get-geom-by-casefolderid.ts";
import {parseMobilePosition, type ParsedMobilePosition} from "../../utils/shapeXmlToGeoJSON.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {parseTime} from "../../utils/parse-time.ts";
import {math} from "@maptiler/sdk";
import {useStorePointsFromCases} from "../../store/useStorePointsFromCases.ts";

type GeometryWithDate = {
    geometry: ParsedMobilePosition;
    created: Date;
};

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
    const [selectedIdx, setSelectedIdx] = useState<Record<number, number | null>>({});
    const addUniqueGeoemetries = useStoreGeometryFromCaseFolderId((state) => state.addUniqueFeature)
    const removeUniqueGeometrie = useStoreGeometryFromCaseFolderId((state) => state.resetSelectedFeature)


    const handleAML = async (id: number) => {
        resetFeatures();
        resetPointOnMap();

        if (geomById[id]) return;

        const resp = await fetchGeom(id);
        const geometry = resp
            ?.map(item => ({
                geometry: parseMobilePosition(item.geometry),
                created: item.Created,
            }))
            .filter(g => g.geometry.type === 'AML' || g.geometry.type === 'MLP')
            .filter(g => {
                const geom = g.geometry.feature;
                if (!geom) return false;
                if (geom.features.length === 0) return false;

                return geom.features.some(f => {
                    if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
                        return f.geometry.coordinates.some(ring => ring.length > 0);
                    }
                    return true;
                });
            }) ?? [];


        setGeomById(prev => ({...prev, [id]: geometry}));
    };

    return (
        <div>
            {items.map((item, n) => (
                <Accordion key={n}
                           onChange={(_, expanded) => expanded && handleAML(item.caseFolderId)}>
                    <AccordionSummary expandIcon={<ArrowDownwardIcon/>}>
                        <Typography>CaseFolderId: {item.caseFolderId}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <AccordionItem label="Tip caz" value={item.caseTypeId}/>
                        <AccordionItem label="Creator" value={item.creator}/>
                        <AccordionItem label="Index nivel 1" value={item.caseIndex1Name}/>
                        <AccordionItem label="Index nivel 2" value={item.caseIndex2Name}/>
                        <AccordionItem label="Fabula" value={item.caseIndexComment}/>

                        <AccordionItem
                            label="Localizare"
                            value={
                                <Button variant="contained" color="warning"
                                        onClick={() => item.XCoordinate && item.YCoordinate &&
                                            setPointOnMap({
                                                XCoordinate: item.XCoordinate,
                                                YCoordinate: item.YCoordinate,
                                            })}>
                                    <Typography fontSize={10}>Punct setat de operator</Typography>
                                </Button>
                            }
                        />
                        {item.created ? (<AccordionItem
                            label="AML"
                            value={
                                <>
                                    {(geomById[item.caseFolderId] ?? []).map((g, n) => {

                                        return (<Button
                                            key={n}
                                            variant="contained"
                                            color={selectedIdx[item.caseFolderId] === n ? "primary" : "error"}
                                            sx={{mt: 1}}
                                            onClick={() => {
                                                const newGeom: StoredGeometry = {
                                                    features: g.geometry.feature,
                                                    type: g.geometry.type
                                                };

                                                addUniqueGeoemetries([newGeom])

                                                setSelectedIdx(prev => ({...prev, [item.caseFolderId]: n}))
                                            }}
                                        >
                                            <Typography fontSize={10}>
                                                {g.geometry.type} {parseTime(g.created)}
                                            </Typography>
                                        </Button>)
                                    })}
                                </>
                            }
                        />) : <p>... no data</p>}


                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};
