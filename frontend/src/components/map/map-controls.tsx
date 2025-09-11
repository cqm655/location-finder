import {useStateGeometry} from "../../store/useStateGeometry.ts";
import {useGetByGeometry} from "../../connect/get-by-geometry.ts";
import {useMemo, useState} from "react";
import dayjs, {Dayjs} from 'dayjs';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import utc from "dayjs/plugin/utc";
import {DateTimeField} from "@mui/x-date-pickers";
import './style.css'
import {useStateSetSideBardAccordionData} from "../../store/useStateSetSideBardAccordionData.ts";

dayjs.extend(utc);

interface MapControlsProps {
    isDrawing: boolean;
    pointsCount: number;
    onToggleDrawing: () => void;
    onUndo: () => void;
    onReset: () => void;
}

export const MapControls = ({
                                isDrawing,
                                pointsCount,
                                onToggleDrawing,
                                onUndo,
                                onReset,
                            }: MapControlsProps) => {

    const [startTime, setStartTime] = useState<Dayjs | null>(dayjs().startOf('day').add(3, 'hour'));
    const [endTime, setEndTime] = useState<Dayjs | null>(dayjs().endOf('day').add(3, 'hour'));
    const data = useStateSetSideBardAccordionData((state) => state.data);
    const geometry = useStateGeometry((state) => state.geometry);

    const requestPayload = useMemo(() => ({
        type: "polygon",
        geometry: geometry,
        startDate: startTime?.utc().format() || dayjs().endOf('day').add(3, 'hour').toString(),
        endDate: endTime?.utc().format() || dayjs().endOf('day').add(3, 'hour').toString(),
    }), [geometry, startTime, endTime]);


    const {resp, error} = useGetByGeometry(requestPayload);

    const onSearch = () => {
        console.log("Trimis la backend:", requestPayload);
        console.log("Răspuns backend:", resp);
        console.log("Răspuns backend:", data);

        console.log("Error backend:", error);

    };

    return (
        <div style={{display: "flex", flexDirection: "column", position: 'relative', zIndex: 10, padding: "8px"}}>
            <button
                onClick={onToggleDrawing}
                className={"map-button"}
                style={{
                    padding: "8px 12px",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: isDrawing ? 'rgba(158, 36, 36, 0.8)' : 'rgba(78, 120, 73,0.8)'
                }}
            >
                {isDrawing ? "Oprește desenarea zonei" : "Pornește desenarea zonei"}
            </button>

            <button
                onClick={onUndo}
                disabled={pointsCount === 0}
                style={{
                    padding: "8px 12px",
                    backgroundColor: pointsCount === 0 ? "gray" : "#f39c12",
                    color: "#fff",
                    border: "none",
                    cursor: pointsCount === 0 ? "not-allowed" : "pointer",
                }}
            >
                Șterge ultimul punct
            </button>

            <button
                onClick={onReset}
                disabled={pointsCount === 0}
                style={{
                    padding: "8px 12px",
                    backgroundColor: pointsCount === 0 ? "gray" : "#e74c3c",
                    color: "#fff",
                    border: "none",
                    cursor: pointsCount === 0 ? "not-allowed" : "pointer",
                }}
            >
                Resetează poligonul
            </button>

            <button
                onClick={onSearch}
                disabled={pointsCount === 0}
                style={{
                    padding: "8px 12px",
                    backgroundColor: pointsCount === 0 ? "gray" : "blue",
                    color: "#fff",
                    border: "none",
                    cursor: pointsCount === 0 ? "not-allowed" : "pointer",
                }}
            >
                Cauta Cazuri
            </button>

            <div style={{
                backgroundColor: "dimgrey",
                marginTop: "8px",
                pointerEvents: "none",
            }}

            >
                <LocalizationProvider dateAdapter={AdapterDayjs}>

                    <DateTimeField
                        style={{width: "160px"}}
                        label="Început de interval"
                        defaultValue={dayjs().startOf('day')}
                        format="YYYY:MM:DD HH:mm"
                        onChange={setStartTime}
                        ampm={false}
                        disabled={pointsCount === 0 ? true : false}
                    />

                    <DateTimeField
                        label="Început de interval"
                        style={{width: "160px"}}
                        defaultValue={dayjs().endOf('day')}
                        format="YYYY:MM:DD HH:mm"
                        onChange={setEndTime}
                        ampm={false}
                        disabled={pointsCount === 0 ? true : false}
                    />
                </LocalizationProvider>
            </div>
        </div>
    );
};

