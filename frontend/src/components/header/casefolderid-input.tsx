import CircularProgress from "@mui/material/CircularProgress";
import {Box, Button, TextField} from "@mui/material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useStateCasefolderId} from "../../store/useStoreGetByCasefolderId.ts";
import {useState} from "react";
import {useStoreToggleSideBar} from "../../store/useStoreToggleSideBar.ts";

export const CasefolderidInput = () => {
    const setCaseFolderId = useStateCasefolderId((state) => state.setCasefolderId)
    const isLoading = useStateCasefolderId((state) => state.isLoading)
    const {openSidebar} = useStoreToggleSideBar()
    const [value, setValue] = useState<string>("")
    const handleSearch = () => {
        setCaseFolderId(value)
        openSidebar()
    }
    return (
        <Box className="search"
             style={{width: "33.33%", display: "flex", alignItems: "center", position: "relative", left: "15%"}}>
            {isLoading && <CircularProgress
                size={"20px"}
                style={{marginRight: "10px"}}
                color="error"/>}
            <Box sx={{display: "flex", alignItems: "center"}}>
                <TextField
                    color={'warning'}
                    id="standard-basic"
                    style={{
                        width: "120px"
                    }}
                    label="CasefolderId..."
                    variant="standard"
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}/>
                <Button variant={'contained'} color={'error'} onClick={handleSearch}><ManageSearchIcon/></Button>
            </Box>

        </Box>
    )
}