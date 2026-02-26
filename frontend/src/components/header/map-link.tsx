import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import {Link} from "react-router";
import {Box} from "@mui/material";

export const MapLink = () => {
    return (
        <Box color={'warrning'} style={{position: 'relative', left: '-30%'}}>
            <Link to={"/map"}

                  style={{
                      padding: "6px",
                      height: "20px",
                      borderRadius: "4px"
                  }}><AddLocationAltIcon fontSize="medium"
                                         color={"error"}
                                         
            /></Link>
        </Box>
    )
}