import {Button} from "@mui/material";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import {useStoreToggleSideBar} from "../../store/useStoreToggleSideBar.ts";

export const ToogleSideBar = () => {

    const isOpen = useStoreToggleSideBar((state) => state.isOpen)
    const {openSidebar} = useStoreToggleSideBar()

    return (
        <div style={{position: "relative", right: "15%"}}>
            <Button onClick={openSidebar}
                    style={{right: "15%"}}>{isOpen ? <MenuOpenIcon fontSize="large" color="error"/> :
                <MenuIcon color="error" fontSize="large"/>}</Button>
        </div>
    )
}