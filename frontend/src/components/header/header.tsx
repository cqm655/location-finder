import {CasefolderidInput} from "./casefolderid-input.tsx";
import {ToogleSideBar} from "./toggle-sidebar.tsx";
import {Logo} from "./logo.tsx";
import {Box} from "@mui/material";

export const Header = () => {
    return (
        <Box sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "70px",
            px: 3,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 1100,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
            {/* Zona Logo */}
            <Box sx={{flex: 1, display: 'flex', alignItems: 'center'}}>
                <Logo/>
            </Box>
            {/* Zona Control (Dreapta) */}
            <Box sx={{flex: 1, display: 'flex', justifyContent: 'flex-left', alignItems: 'center', gap: 2}}>
                <ToogleSideBar/>
            </Box>
            {/* Zona Căutare (Centru) */}
            <Box sx={{flex: 2, display: 'flex', justifyContent: 'center'}}>
                <CasefolderidInput/>
            </Box>


        </Box>
    );
};
