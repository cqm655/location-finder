import {Box, LinearProgress, Stack} from "@mui/material";
import {useStoreToggleSideBar} from "../../store/useStoreToggleSideBar.ts";
import {AccordionComponent} from "./accordion-component.tsx";
import {useGetByCaseFolderId} from "../../connect/get-by-casefolderid.ts";
import {useStateCasefolderId} from "../../store/useStoreGetByCasefolderId.ts";
import {useStoreSetSideBardAccordionData} from "../../store/useStoreSetSideBardAccordionData.ts";

export const Sidebar = () => {
    const {resp} = useGetByCaseFolderId();
    const loading = useStateCasefolderId((state) => state.isLoading);
    const isOpen = useStoreToggleSideBar((state) => state.isOpen);
    const data = useStoreSetSideBardAccordionData((state) => state.data);

    const SIDEBAR_WIDTH = 500; // Definim lățimea într-un singur loc

    return (
        <Box
            sx={{
                width: isOpen ? `${SIDEBAR_WIDTH}px` : "0px", // Animăm între 500px și 0px (fără 'auto')
                minWidth: isOpen ? `${SIDEBAR_WIDTH}px` : "0px",
                overflow: "hidden", // Ascunde conținutul care trece peste margine când se închide
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Animație smooth identică cu drawer-ele standard
                visibility: isOpen ? "visible" : "hidden", // Previne interacțiunea când e închis
            }}
        >
            <Stack
                spacing={1}
                sx={{
                    width: `${SIDEBAR_WIDTH}px`,
                    height: "92vh",
                    overflowX: "hidden", // Fără scrollbar orizontal
                }}
            >
                <Box>
                    {loading && (
                        <Box sx={{width: "auto"}}>
                            <LinearProgress color="error"/>
                        </Box>
                    )}
                </Box>

                <Box sx={{width: "auto"}}>
                    {data && data.length > 0 && <AccordionComponent data={data}/>}
                    {(!data || data.length === 0) && resp && (
                        <AccordionComponent data={resp} disableFilter={true}/>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};