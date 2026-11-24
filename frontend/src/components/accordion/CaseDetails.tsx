import {useEffect} from "react";
import {Stack} from "@mui/material";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {CaseInfoGrid} from "./CaseInfoGrid.tsx";
import {LogsPanel} from "./LogsPanel.tsx";
import {OperatorLocationPanel} from "./OperatorLocationPanel.tsx";
import {AudioPanel} from "./AudioPanel.tsx";
import {SeqPanel} from "./SeqPanel.tsx";
import {LocationHistoryPanel} from "./LocationHistoryPanel.tsx";

interface Props {
    item: ApiCaseFolderIdResponse;
    expanded: boolean; // true doar când folderul e deschis
}

export const CaseDetails = ({item, expanded}: Props) => {
    const resetFeatures = useStoreGeometryFromCaseFolderId((s) => s.resetSelectedFeature);
    const resetPointOnMap = useStoreAddPointOnMap((s) => s.resetCoordinates);

    const caseFolderId = item.caseFolderId;
    const dateTime = item.created;

    // Curățăm harta când se deschide folderul sau se schimbă tabul (fișa)
    useEffect(() => {
        if (expanded) {
            resetFeatures();
            resetPointOnMap();
        }
    }, [expanded, item.caseId, resetFeatures, resetPointOnMap]);

    if (caseFolderId == null) return null;

    return (
        <>
            <CaseInfoGrid item={item}/>

            <Stack direction="column" spacing={2}>
                <LogsPanel caseFolderId={caseFolderId}/>
                <OperatorLocationPanel item={item}/>
                <AudioPanel caseFolderId={caseFolderId}/>
                <SeqPanel caseFolderId={caseFolderId} phoneNumber={item.phoneNumber} dateTime={dateTime}/>
                <LocationHistoryPanel caseFolderId={caseFolderId} expanded={expanded}/>
            </Stack>
        </>
    );
};