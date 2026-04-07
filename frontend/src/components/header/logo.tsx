import logo112 from '../../assets/112.png'
import {Box} from "@mui/material";

export const Logo = () => {
    return (
        <Box
            component="img"
            src={logo112}
            alt="logo"
            sx={{
                height: "50px",
                width: "auto",
                transition: "transform 0.2s ease",
                cursor: "pointer",
                "&:hover": {
                    transform: "scale(1.05)"
                }
            }}
        />
    );
};
