import {Box} from "@mui/material";

import {parseTime} from "../../utils/parse-time.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";
import {AccordionItem} from "../sidebar/Accordion-item.tsx";

export const CaseInfoGrid = ({item}: { item: ApiCaseFolderIdResponse }) => (
    <Box sx={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3}}>
        <AccordionItem label="Creator" value={item.creator}/>
        <AccordionItem label="Timp Creare" value={parseTime(item.created || " ")}/>
        <AccordionItem label="Tip caz" value={item.caseTypeName}/>
        <AccordionItem label="Nivel 1" value={item.caseIndex1Name}/>
        <AccordionItem label="Nivel 2" value={item.caseIndex2Name}/>
        <AccordionItem label="Telefon" value={item.phoneNumber}/>
        <AccordionItem label="Apelant" value={item.orderer ?? " - -"}/>
        <AccordionItem label="Address" value={item.address}/>

        <Box sx={{gridColumn: "span 2"}}>
            <AccordionItem label="Comentarii caz" value={item.caseIndexComment || "Fără comentarii"}/>
        </Box>
        <Box sx={{gridColumn: "span 2"}}>
            <AccordionItem label="Comentarii dosar" value={item.caseFolderIndexComment || "Fără comentarii"}/>
        </Box>
    </Box>
);