import {AccordionItem} from "./Accordion-item.tsx";
import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import {useGetGeomByCasefolderid} from "../../connect/get-geom-by-casefolderid.ts";
import {type ParsedMobilePosition, parseMobilePosition} from "../../utils/shapeXmlToGeoJSON.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {useState} from "react";

interface Props {
    data: ApiCaseFolderIdResponse[] | ApiCaseFolderIdResponse;
}

type GeometryWithDate = {
    geometry: ParsedMobilePosition;
    created: Date;
};

export const AccordionComponent = ({data}: Props) => {
    const [resp, setResp] = useState<GeometryWithDate[]>([]);
    const items = Array.isArray(data) ? data : [data];
    const setPointOnMap = useStoreAddPointOnMap((state) => state.setCoordinate);
    const setGeomFromCaseFolderId = useStoreGeometryFromCaseFolderId(
        (state) => state.setSelectedFeature
    );
    const getGeometryFromCaseFolderId = useStoreGeometryFromCaseFolderId(
        (state) => state.selectedFeature
    );
    const {fetchGeom} = useGetGeomByCasefolderid();
    const resetFeatures = useStoreGeometryFromCaseFolderId(
        (state) => state.resetSelectedFeature
    );

    const handleAML = async (id: number) => {
        resetFeatures();
        const resp = await fetchGeom(id);
        const geometry = resp
            ?.map((item) => ({
                geometry: parseMobilePosition(item.geometry),
                created: item.Created,
            }))
            .filter(g => g.geometry.type === 'AML' || g.geometry.type === 'MLP')
            .filter(g => {
                const geom = g.geometry.feature;
                if (!geom) return false;

                if (geom.features.length === 0) return false;

                // verificăm fiecare feature
                const hasCoordinates = geom.features.some(f => {
                    if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
                        // Polygon: verificăm primul ring
                        return f.geometry.coordinates.some(ring => ring.length > 0);
                    }
                    // Point sau LineString considerăm valid
                    return true;
                });

                return hasCoordinates;
            });

        console.log(geometry)
        setResp(geometry || [])
        // geometry?.forEach((g) => {
        //     if (g.geometry.type !== "UNKNOWN") {
        //         setGeomFromCaseFolderId(g.geometry.type, g.geometry.feature, g.geometry.raw, g.created);
        //     }
        // });
    };

    return (
        <div>
            {items.map((item) => (
                <Accordion key={item.caseFolderId}>
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
                                <button
                                    onClick={() =>
                                        item.XCoordinate &&
                                        item.YCoordinate &&
                                        setPointOnMap({
                                            XCoordinate: item.XCoordinate,
                                            YCoordinate: item.YCoordinate,
                                        })
                                    }
                                >
                                    Punct setat de operator
                                </button>
                            }
                        />

                        <AccordionItem
                            label="AML"
                            value={
                                <>
                                    <button onClick={() => handleAML(item.caseFolderId)}>
                                        Fetch AML
                                    </button>
                                    {resp.map((item) => (
                                        <div onClick={() => {
                                            setGeomFromCaseFolderId(item.geometry)
                                            console.log(item.geometry,)
                                        }}>{item.created.toString() + ' ' + item.geometry.type}</div>
                                    ))}
                                </>
                            }
                        />
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};
