import {Button, Paper, Typography} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import type {ApiCaseFolderIdResponse} from "../../connect/types.ts";

export const OperatorLocationPanel = ({item}: { item: ApiCaseFolderIdResponse }) => {
    const setPointOnMap = useStoreAddPointOnMap((s) => s.setCoordinate);
    const {xCoordinate, yCoordinate} = item;

    return (
        <Paper variant="outlined" sx={{p: 2, bgcolor: "#fffaf0"}}>
            <Typography variant="subtitle2" gutterBottom sx={{display: "flex", alignItems: "center", gap: 1}}>
                <LocationOnIcon fontSize="small" color="warning"/> Localizare Operator
            </Typography>
            <Button
                fullWidth
                variant="contained"
                color="warning"
                disabled={!xCoordinate || !yCoordinate}
                onClick={() =>
                    xCoordinate &&
                    yCoordinate &&
                    setPointOnMap({XCoordinate: xCoordinate, YCoordinate: yCoordinate})
                }
                sx={{textTransform: "none", borderRadius: 2}}
            >
                Setați coordonatele pe hartă
            </Button>
        </Paper>
    );
};