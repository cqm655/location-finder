import {Box, LinearProgress, Stack} from "@mui/material"
import {useStateToggleSideBar} from "../../store/useStateToggleSideBar.ts";
import {AccordionComponent} from "./accordion-component.tsx";
import {useGetByCaseFolderId} from "../../connect/get-by-casefolderid.ts";
import {useStateCasefolderId} from "../../store/useStateGetByCasefolderId.ts";
import {useStateSetSideBardAccordionData} from "../../store/useStateSetSideBardAccordionData.ts";


export const Sidebar = () => {


    const {resp} = useGetByCaseFolderId()
    const loading = useStateCasefolderId((state) => state.isLoading)
    const isOpen = useStateToggleSideBar((state) => state.isOpen)
    const data = useStateSetSideBardAccordionData((state) => state.data);


    return (
        <div style={{
            width: !isOpen ? "0px" : "300px",
            display: 'flex',
            justifyContent: "end",
            transition: 'width 0.6s ease'
        }}>

            <Stack spacing={2} style={{overflow: 'auto', height: '92vh'}}>
                <div style={{marginRight: '10px'}}>
                    {loading && <Box sx={{width: '100%'}}>
                        <LinearProgress color={"error"}/>
                    </Box>}
                </div>
                <div>
                    {resp && <AccordionComponent data={resp}/>}
                    {data && <AccordionComponent data={data}/>}
                </div>
            </Stack>
        </div>
    )
}