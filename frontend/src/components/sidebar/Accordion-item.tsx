import type {ReactNode} from "react";
import {
    Accordion,
    AccordionDetails,
    Divider,
    Paper,
    Typography
} from "@mui/material";
import {styled} from "@mui/material/styles";

const Item = styled(Paper)(({theme}) => ({
    ...theme.typography.body2,
    textAlign: "center",
    color: theme.palette.text.secondary,
    padding: "4px 8px",
}));

interface AccordionItemProps {
    label: string;
    value?: ReactNode;
}

export function AccordionItem({label, value}: AccordionItemProps) {
    return (
        <Accordion>
            <AccordionDetails>
                <Typography component="span">{label}</Typography>
                <Item elevation={4}>{value ?? "—"}</Item>
                <Divider/>
            </AccordionDetails>
        </Accordion>
    );
}
