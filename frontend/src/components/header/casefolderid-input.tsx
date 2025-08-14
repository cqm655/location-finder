import CircularProgress from "@mui/material/CircularProgress";
import {TextField} from "@mui/material";

import {useStateCasefolderId} from "../../store/useStateGetByCasefolderId.ts";

export const CasefolderidInput = () => {
    const setCaseFolderId = useStateCasefolderId((state) => state.setCasefolderId)
    const isLoading = useStateCasefolderId((state) => state.isLoading)
    return (
        <div className="search"
             style={{width: "33.33%", display: "flex", alignItems: "center", position: "relative", left: "15%"}}>
            {isLoading && <CircularProgress
                size={"20px"}
                style={{marginRight: "10px"}}
                color="error"/>}
            <TextField
                id="standard-basic"
                style={{
                    marginRight: "20%",
                    width: "100px"

                }}
                label="CasefolderId..."
                variant="standard"
                onChange={(e) => {
                    setCaseFolderId(e.target.value)
                }}/>
        </div>
    )
}