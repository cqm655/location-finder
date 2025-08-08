import {Box, LinearProgress, Stack} from "@mui/material"
import {useStateToggleSideBar} from "../../store/useStateToggleSideBar.ts";
import {AccordionComponent} from "./accordion.tsx";
import {useGetByCaseFolderId} from "../../connect/get-by-casefolderid.ts";
import {useStateCasefolderId} from "../../store/useStateGetByCasefolderId.ts";


export const Sidebar = () => {
    const {isOpen} = useStateToggleSideBar()
    const {resp} = useGetByCaseFolderId()
    const loading = useStateCasefolderId((state) => state.isLoading)
    return (
        <div style={{
            width: !isOpen ? "3px" : "300px",
            display: 'flex',
            justifyContent: "end",
            transition: 'width 0.6s ease'
        }}>

            <Stack spacing={2}>
                <div style={{marginRight: '10px'}}>
                    {loading && <Box sx={{width: '100%'}}>
                        <LinearProgress color={"error"}/>
                    </Box>}
                </div>
                {resp && <AccordionComponent data={resp}/>}
            </Stack>
        </div>
    )
}