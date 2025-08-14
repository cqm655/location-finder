import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import {Link} from "react-router";

export const MapLink = () => {
    return (
        <div>
            <Link to={"/map"}
                  style={{
                      padding: "6px",
                      height: "20px",
                      borderRadius: "4px"
                  }}><AddLocationAltIcon fontSize="medium"
                                         color={"error"}
            /></Link>
        </div>
    )
}