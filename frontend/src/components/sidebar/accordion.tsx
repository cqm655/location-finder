import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";

interface Props {
    data?: ApiCaseFolderIdResponse; // Acceptă array
}

export const AccordionComponent = ({data}: Props) => {

    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ArrowDownwardIcon/>}
                    aria-controls={`panel${data?.caseFolderId}-content`}
                    id={`panel${data?.caseFolderId}-header`}
                >
                    <Typography component="span">
                        CaseFolderId: {data?.caseFolderId}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        {data?.caseIndexComment}
                    </Typography>
                </AccordionDetails>
            </Accordion>

        </div>
    );
};
