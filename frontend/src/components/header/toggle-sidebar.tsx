import {IconButton, Tooltip} from "@mui/material";
import {useStoreToggleSideBar} from "../../store/useStoreToggleSideBar.ts";
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';

export const ToogleSideBar = () => {
    const isOpen = useStoreToggleSideBar((state) => state.isOpen);
    const {toggleSidebar} = useStoreToggleSideBar(); // Presupun că ai și o funcție de toggle

    return (
        <Tooltip title={isOpen ? "Închide Panoul" : "Deschide Panoul"}>
            <IconButton
                onClick={toggleSidebar}
                sx={{
                    backgroundColor: isOpen ? "rgba(211, 47, 47, 0.1)" : "transparent",
                    border: "1px solid",
                    borderColor: isOpen ? "error.main" : "transparent",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        backgroundColor: "rgba(211, 47, 47, 0.05)"
                    }
                }}
            >
                {isOpen ?
                    <MenuOpenIcon sx={{fontSize: 32, color: "error.main"}}/> :
                    <MenuIcon sx={{fontSize: 32, color: "error.main"}}/>
                }
            </IconButton>
        </Tooltip>
    );
};
