import {useState} from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Divider, Stack, Tab, Tabs, Typography} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Doc from "../../assets/doc.png";
import {getSsuIconType} from "../../utils/parse-ssu-icon.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {CaseDetails} from "./CaseDetails.tsx";

interface Props {
    caseFolderId: number;
    cases: ApiCaseFolderIdResponse[];
    expanded: boolean;
    onToggle: (expanded: boolean) => void;
}

export const FolderAccordionItem = ({caseFolderId, cases, expanded, onToggle}: Props) => {
    const [tab, setTab] = useState(0);
    const activeCase = cases[tab] ?? cases[0];

    return (
        <Accordion
            expanded={expanded}
            onChange={(_, isExpanded) => onToggle(isExpanded)}
            sx={{
                borderRadius: "8px !important",
                "&:before": {display: "none"},
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
        >
            {/* Antet: doar o dată per folder */}
            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <img src={Doc} style={{width: 24, height: 24}} alt="Folder"/>
                    <Typography sx={{fontWeight: "bold", minWidth: 80}}>#{caseFolderId}</Typography>
                    <Divider orientation="vertical" flexItem/>
                    {/* mici iconițe de preview când e închis */}
                    {!expanded && cases.map((c) => (
                        <img
                            key={c.caseId}
                            src={getSsuIconType(c.caseTypeId ?? 0)}
                            style={{height: 24, width: "auto"}}
                            alt={c.caseTypeName ?? ""}
                        />
                    ))}
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{pt: 0, px: 1, pb: 3}}>
                <Divider/>

                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="fullWidth"
                    sx={{borderBottom: 1, borderColor: "divider", mb: 2}}
                >
                    {cases.map((c) => (
                        <Tab
                            key={c.caseId}
                            icon={
                                <img
                                    src={getSsuIconType(c.caseTypeId ?? 0)}
                                    style={{height: 28, width: "auto"}}
                                    alt={c.caseTypeName ?? ""}
                                />
                            }
                            aria-label={c.caseTypeName ?? `Fișa ${c.caseId}`}
                            sx={{minHeight: 48}}
                        />
                    ))}
                </Tabs>

                {/* key => la schimbarea tabului, starea internă (SEQ, audio etc.) se resetează */}
                <Box sx={{px: 2}}>
                    <CaseDetails key={activeCase.caseId} item={activeCase} expanded={expanded}/>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};