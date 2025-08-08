import {Button} from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import {useStateToggleSideBar} from "../../store/useStateToggleSideBar.ts";

export const ToogleSideBar = () => {

    const isOpen = useStateToggleSideBar((state) => state.isOpen)
    const {openSidebar} = useStateToggleSideBar()

    return (
        <Button onClick={openSidebar}
                style={{right: "15%"}}>{isOpen ? <MenuOpenIcon fontSize="large" color="error"/> :
            <MenuIcon color="error" fontSize="large"/>}</Button>
    )
}