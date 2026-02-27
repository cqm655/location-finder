import {useStoreGeometry} from "../../store/useStoreGeometry.ts";
import {useGetByGeometry} from "../../connect/get-by-geometry.ts";
import {useMemo, useState} from "react";
import dayjs, {Dayjs} from 'dayjs';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import utc from "dayjs/plugin/utc";
import {DateTimePicker} from "@mui/x-date-pickers"; // Recomand DateTimePicker pentru popup
import {
    Box,
    Button,
    ButtonGroup,
    Typography,
    Paper,
    Stack,
    Divider
} from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import StopIcon from '@mui/icons-material/Stop';

dayjs.extend(utc);

interface MapControlsProps {
    isDrawing: boolean;
    pointsCount: number;
    onToggleDrawing: () => void;
    onUndo: () => void;
    onReset: () => void;
    onSearch: () => void;
}

export const MapControls = ({
                                isDrawing,
                                pointsCount,
                                onToggleDrawing,
                                onUndo,
                                onReset,
                            }: MapControlsProps) => {

    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().startOf('day'));
    const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().endOf('day'));
    const geometry = useStoreGeometry((state) => state.geometry);

    const requestPayload = useMemo(() => ({
        type: "polygon",
        geometry: geometry,
        startDate: startTime?.utc().format() || dayjs().toISOString(),
        endDate: endTime?.utc().format() || dayjs().toISOString(),
    }), [geometry, startTime, endTime]);

    const handleSearch = () => {
        console.log("Căutare executată:", requestPayload);
    };

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'relative',
                top: 20,
                left: 20,
                zIndex: 1000,
                width: 320,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)'
            }}
        >
            <Typography variant="subtitle2"
                        sx={{mb: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1}}>
                <CreateIcon fontSize="small"/> Control Zonă Căutare
            </Typography>

            <Stack spacing={2}>
                {/* Butonul Principal de Desenare */}
                <Button
                    fullWidth
                    variant="contained"
                    color={isDrawing ? "error" : "primary"}
                    onClick={onToggleDrawing}
                    startIcon={isDrawing ? <StopIcon/> : <CreateIcon/>}
                    sx={{py: 1}}
                >
                    {isDrawing ? "Oprește desenarea" : "Pornește desenarea"}
                </Button>

                {/* Acțiuni secundare */}
                <ButtonGroup fullWidth size="small" variant="outlined" disabled={pointsCount === 0}>
                    <Button onClick={onUndo} startIcon={<UndoIcon/>}>Undo</Button>
                    <Button onClick={onReset} startIcon={<DeleteSweepIcon/>} color="error">Reset</Button>
                </ButtonGroup>

                <Divider sx={{my: 1}}>Interval Timp</Divider>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Stack spacing={2}>
                        <DateTimePicker
                            label="Început"
                            value={startTime}
                            onChange={(newValue) => setStartTime(newValue)}
                            ampm={false}
                            slotProps={{textField: {size: 'small', fullWidth: true}}}
                        />
                        <DateTimePicker
                            label="Sfârșit"
                            value={endTime}
                            onChange={(newValue) => {
                                setEndTime(newValue);
                                if (newValue && !isDrawing) handleSearch();
                            }}
                            ampm={false}
                            slotProps={{textField: {size: 'small', fullWidth: true}}}
                        />
                    </Stack>
                </LocalizationProvider>

                {/* Info Points & Search */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1}}>
                    <Typography variant="caption" color="text.secondary">
                        Puncte poligon: <strong>{pointsCount}</strong>
                    </Typography>

                </Box>
            </Stack>
        </Paper>
    );
};
