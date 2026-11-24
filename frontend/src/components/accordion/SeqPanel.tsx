import {useState} from "react";
import {Button, Paper, Stack, Typography} from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import {useStoreAddPointOnMap} from "../../store/useStoreAddPointOnMap.ts";
import {useStoreGeometryFromCaseFolderId} from "../../store/useStoreGeometryFromCaseFolderId.ts";
import type {LocationItem} from "../../connect/types.ts";
import {EMPTY_SEQ_CASE, seqKey, useStoreSeqSearch} from "../../store/useStoreSeqSearch.ts";


// Singurul loc care decide ce înseamnă X și Y pentru hartă: X = longitudine, Y = latitudine.
const toMapPoint = ({lon, lat}: LocationItem["center"]) => ({XCoordinate: lat, YCoordinate: lon});

interface Props {
    caseFolderId: number;
    phoneNumber?: string | null;
    dateTime: string;
}

const getDateRange = (created: string | Date) => {
    const date = created instanceof Date
        ? created
        : new Date(
            created.includes("T")
                ? created
                : created.replace(" ", "T") + "Z"
        );

    if (isNaN(date.getTime())) {
        console.error("Invalid created date:", created);
        return null;
    }

    const ONE_DAY = 24 * 60 * 60 * 1000;

    return {
        from: new Date(date.getTime() - ONE_DAY).toISOString(),
        to: new Date(date.getTime() + ONE_DAY).toISOString()
    };
};

export const SeqPanel = ({caseFolderId, phoneNumber, dateTime}: Props) => {
    const key = seqKey(caseFolderId, phoneNumber);
    const seq = useStoreSeqSearch((s) => s.byKey[key] ?? EMPTY_SEQ_CASE);
    const search = useStoreSeqSearch((s) => s.search);
    const setPointOnMap = useStoreAddPointOnMap((s) => s.setCoordinate);
    const addUniqueGeometries = useStoreGeometryFromCaseFolderId((s) => s.addUniqueFeature);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const handleSearch = () => {
        const phone = phoneNumber?.trim();
        if (!phone) return;

        const range = getDateRange(dateTime);

        if (!range) return;

        const {from, to} = range;

        setSelectedIdx(null);
        void search({caseFolderId, phone, from: from, to: to});
    };

    const showOnMap = (index: number, location: LocationItem) => {
        setSelectedIdx(index);

        if (location.kind === "MLP" && location.polygon && location.polygon.length >= 3) {
            const ring: number[][] = location.polygon.map((p) => [p.lon, p.lat]);
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]); // GeoJSON cere inel închis


            addUniqueGeometries([
                {
                    type: "MLP",
                    features: {
                        type: "FeatureCollection",
                        features: [
                            {
                                type: "Feature",
                                geometry: {type: "Polygon", coordinates: [ring]},
                                properties: {
                                    kind: location.kind,
                                    timeUtc: location.timeUtc,
                                    phone: location.phone,
                                },
                            },
                        ],
                    },
                },
            ]);
            return;
        }

        // AML sau MLP fără poligon: punct
        setPointOnMap(toMapPoint(location.center));
    };

    return (
        <Paper variant="outlined" sx={{p: 2, bgcolor: "#f3f9f4"}}>
            <Typography variant="subtitle2" gutterBottom sx={{display: "flex", alignItems: "center", gap: 1}}>
                <TravelExploreIcon fontSize="small" color="success"/>
                Localizare SEQ
            </Typography>

            <Button
                fullWidth
                variant="contained"
                color="success"
                disabled={!String(phoneNumber ?? "").trim() || seq.loading}
                onClick={handleSearch}
                sx={{textTransform: "none", borderRadius: 2}}
            >
                {seq.loading
                    ? "Se încarcă localizările..."
                    : seq.searched
                        ? "Caută din nou"
                        : "Încarcă localizări din SEQ"}
            </Button>

            {seq.loading && (
                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                    Se caută localizările asociate numărului de telefon...
                </Typography>
            )}

            {!seq.loading && seq.error && (
                <Typography variant="body2" color="error" sx={{mt: 1}}>
                    {seq.error}
                </Typography>
            )}

            {!seq.loading && !seq.error && seq.searched && seq.results.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                    Nu s-au găsit localizări în SEQ pentru acest număr.
                </Typography>
            )}

            {!seq.loading && !seq.error && seq.results.length > 0 && (
                <Stack spacing={1} sx={{mt: 2}}>
                    {seq.results.map((location, index) => (

                        <Button
                            key={`${caseFolderId}-seq-${location.kind}-${location.timeUtc}-${index}`}
                            fullWidth
                            variant="outlined"
                            onClick={() => showOnMap(index, location)}
                            sx={{
                                textTransform: "none",
                                borderRadius: 1,
                                py: 1,
                                color: "#2e7d32",
                                borderColor: selectedIdx === index ? "#2e7d32" : "#81c784",
                                bgcolor: selectedIdx === index ? "rgba(46, 125, 50, 0.10)" : "transparent",
                                "&:hover": {
                                    bgcolor: "rgba(46, 125, 50, 0.08)",
                                    borderColor: "#2e7d32",
                                },
                            }}
                        >

                            {`${location.kind}${location.source === "phone" ? " (după telefon)" : ""} | ${new Date(location.timeUtc).toLocaleString("ro-RO", {
                                timeZone: "Europe/Chisinau",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}`}
                        </Button>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};