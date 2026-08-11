import {type FormEvent, useState} from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    IconButton,
    Collapse,
    Alert,
    CircularProgress,
    Stack,
    Avatar,
    CssBaseline,
    ThemeProvider,
    createTheme,
} from '@mui/material';
import {keyframes} from '@emotion/react';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CellTowerIcon from '@mui/icons-material/CellTower';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import {useAuth} from "../../../connect/auth.ts";
import {useNavigate} from "react-router";


// ---------- Temă 112 Moldova (Red Dispatch Theme) ----------
const theme112 = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0A0506', // Fundal foarte întunecat cu tentă subtilă de roșu
            paper: '#140A0C',
        },
        primary: {
            main: '#E53935', // Roșu Serviciul 112
            light: '#FF5252',
            dark: '#B71C1C',
        },
        error: {main: '#FF1744'},
        warning: {main: '#FF9100'},
        text: {
            primary: '#F5F5F7',
            secondary: '#A08D90',
        },
        divider: 'rgba(229, 57, 53, 0.2)',
    },
    typography: {fontFamily: "'Inter', system-ui, sans-serif"},
    shape: {borderRadius: 14},
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(20, 10, 12, 0.65)',
                        '& fieldset': {
                            borderColor: 'rgba(229, 57, 53, 0.25)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 82, 82, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#E53935',
                        },
                    },
                },
            },
        },
    },
});

// ---------- Keyframes Animații Localizare (AML / MLP) ----------

// AML: Pulsarea razei de acuratețe a locației GPS
const amlPulse = keyframes`
    0% {
        r: 30px;
        stroke-opacity: 0.8;
        fill-opacity: 0.25;
    }
    50% {
        fill-opacity: 0.05;
    }
    100% {
        r: 180px;
        stroke-opacity: 0;
        fill-opacity: 0;
    }
`;

// MLP: Trasarea liniilor vectoriale de celulă/triangulație turn
const mlpDrawLine = keyframes`
    0% {
        stroke-dashoffset: 600;
        opacity: 0.2;
    }
    50% {
        stroke-dashoffset: 0;
        opacity: 0.8;
    }
    100% {
        stroke-dashoffset: -600;
        opacity: 0.2;
    }
`;

// Sweep Radar de dispecerat
const radarSweep = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`;

const badgeGlowRed = keyframes`
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(229, 57, 53, 0.6);
    }
    50% {
        box-shadow: 0 0 0 14px rgba(229, 57, 53, 0);
    }
`;

const shake = keyframes`
    0%, 100% {
        transform: translateX(0);
    }
    20% {
        transform: translateX(-8px);
    }
    40% {
        transform: translateX(7px);
    }
    60% {
        transform: translateX(-5px);
    }
    80% {
        transform: translateX(3px);
    }
`;

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [shakeError, setShakeError] = useState(false);
    const [loading, setLoading] = useState(false);
    const {fetchUser} = useAuth();
    const navigate = useNavigate(); // Hook-ul pentru redirect

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password) {
            setError('Introdu utilizator și parolă.');
            triggerShake();
            return;
        }

        setLoading(true);
        try {
            const user = {username, password};
            await fetchUser(user)


        } catch {
            setError('Nu s-a putut contacta serverul 112.');
            triggerShake();
        } finally {
            navigate('/', {replace: true});
            setLoading(false);
        }
    }

    function triggerShake() {
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
    }

    return (
        <ThemeProvider theme={theme112}>
            <CssBaseline/>
            <Box
                sx={{
                    minHeight: '100vh',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    background:
                        'radial-gradient(circle at 50% 50%, #1A0507 0%, #0A0506 85%)',
                }}
            >
                {/* ---------- FUNDAL ANIMAT SVG (AML & MLP LOGIC) ---------- */}
                <Box
                    component="svg"
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                >
                    <defs>
                        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#E53935" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#E53935" stopOpacity="0"/>
                        </radialGradient>
                    </defs>

                    {/* Rețea Grid GIS Fundal */}
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(229, 57, 53, 0.05)" strokeWidth="1"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)"/>

                    {/* Centru GIS - Coordonate fictive Dispecerat */}
                    <g transform="translate(50vw, 50vh)">
                        {/* Cercuri concentrice fundal static */}
                        <circle r="100" stroke="rgba(229, 57, 53, 0.12)" strokeWidth="1" fill="none"/>
                        <circle r="220" stroke="rgba(229, 57, 53, 0.08)" strokeWidth="1" strokeDasharray="4 4"
                                fill="none"/>
                        <circle r="360" stroke="rgba(229, 57, 53, 0.05)" strokeWidth="1" fill="none"/>

                        {/* ANIMAȚIE AML (Advanced Mobile Location) - Cercuri cu rază de incertitudine GPS */}
                        <circle
                            cx="0"
                            cy="0"
                            stroke="#FF5252"
                            strokeWidth="2"
                            fill="#E53935"
                            style={{animation: `${amlPulse} 4s ease-out infinite`}}
                        />
                        <circle
                            cx="0"
                            cy="0"
                            stroke="#E53935"
                            strokeWidth="1.5"
                            fill="#E53935"
                            style={{animation: `${amlPulse} 4s ease-out infinite 2s`}}
                        />

                        {/* ANIMAȚIE MLP (Mobile Location Protocol) - Vectori triangulație GSM */}
                        <path
                            d="M -300 -200 L 0 0 L 350 -150 L 0 0 L 120 300"
                            stroke="#E53935"
                            strokeWidth="1.5"
                            fill="none"
                            strokeDasharray="200"
                            style={{animation: `${mlpDrawLine} 6s linear infinite`}}
                        />

                        {/* Punct de origine (Locație Apelant identificat) */}
                        <circle cx="0" cy="0" r="4" fill="#FF5252"/>
                    </g>
                </Box>

                {/* Fascicul Radar / Scanner GIS */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '700px',
                        height: '700px',
                        borderRadius: '50%',
                        background: 'conic-gradient(from 0deg, rgba(229, 57, 53, 0.18) 0deg, transparent 60deg, transparent 360deg)',
                        animation: `${radarSweep} 10s linear infinite`,
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                {/* ---------- FORMULARUL PRINCIPAL DE LOGIN ---------- */}
                <Paper
                    component="form"
                    onSubmit={handleSubmit}
                    elevation={0}
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        maxWidth: 400,
                        p: 4,
                        border: '1px solid',
                        borderColor: 'rgba(229, 57, 53, 0.3)',
                        bgcolor: 'rgba(20, 10, 12, 0.82)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.67), 0 0 20px 0 rgba(229, 57, 53, 0.15)',
                        animation: shakeError ? `${shake} 0.5s` : 'none',
                    }}
                >
                    {/* Antet cu Logo/Icon 112 */}
                    <Stack direction="row" alignItems="center" spacing={2} sx={{mb: 1}}>
                        <Avatar
                            sx={{
                                bgcolor: 'rgba(229, 57, 53, 0.15)',
                                color: 'primary.light',
                                width: 48,
                                height: 48,
                                border: '1px solid rgba(229, 57, 53, 0.4)',
                                animation: `${badgeGlowRed} 2.4s ease-in-out infinite`,
                            }}
                        >
                            <PhoneInTalkIcon/>
                        </Avatar>
                        <Box>
                            <Typography sx={{fontWeight: 800, fontSize: 20, letterSpacing: '0.02em', color: '#FFF'}}>
                                112 MOLDOVA
                            </Typography>
                            <Typography variant="caption"
                                        sx={{color: 'primary.light', fontWeight: 600, display: 'block'}}>
                                Sistem de Localizare Apelant
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Indicator Tehnologii Activated */}
                    <Stack direction="row" spacing={1} sx={{mt: 2, mb: 3}}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                bgcolor: 'rgba(229, 57, 53, 0.1)',
                                border: '1px solid rgba(229, 57, 53, 0.2)',
                            }}
                        >
                            <GpsFixedIcon sx={{fontSize: 12, color: 'primary.light'}}/>
                            <Typography sx={{fontSize: 10, fontWeight: 700, color: 'primary.light'}}>
                                AML
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                bgcolor: 'rgba(229, 57, 53, 0.1)',
                                border: '1px solid rgba(229, 57, 53, 0.2)',
                            }}
                        >
                            <CellTowerIcon sx={{fontSize: 12, color: 'primary.light'}}/>
                            <Typography sx={{fontSize: 10, fontWeight: 700, color: 'primary.light'}}>
                                MLP
                            </Typography>
                        </Box>
                    </Stack>

                    <Typography sx={{mb: 2.5, fontSize: 13, color: 'text.secondary'}}>
                        Autentificați-vă cu contul de domeniu pentru a accesa consola de dispecerat.
                    </Typography>

                    {/* Câmpuri Formular */}
                    <Stack spacing={2}>
                        <TextField
                            label="Utilizator operare"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonOutlineIcon sx={{color: 'text.secondary', fontSize: 20}}/>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Parolă"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon sx={{color: 'text.secondary', fontSize: 20}}/>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowPassword((s) => !s)}
                                            edge="end"
                                            sx={{color: 'text.secondary'}}
                                        >
                                            {showPassword ? <VisibilityOffIcon fontSize="small"/> :
                                                <VisibilityIcon fontSize="small"/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    {/* Eroare */}
                    <Collapse in={!!error}>
                        <Alert severity="error" variant="outlined" sx={{mt: 2, bgcolor: 'rgba(255, 23, 68, 0.05)'}}>
                            {error}
                        </Alert>
                    </Collapse>

                    {/* Buton Conectare */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                            mt: 3,
                            py: 1.2,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            fontSize: 14,
                            boxShadow: '0 4px 14px 0 rgba(229, 57, 53, 0.39)',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                boxShadow: '0 6px 20px 0 rgba(229, 57, 53, 0.55)',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={22} sx={{color: '#FFF'}}/> : 'AUTENTIFICARE'}
                    </Button>

                    {/* Footer Securitate */}
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.75} sx={{mt: 3}}>
                        <ShieldOutlinedIcon sx={{fontSize: 14, color: 'text.secondary'}}/>
                        <Typography sx={{fontSize: 11, color: 'text.secondary'}}>
                            Acces restricționat · Monitorizat 112 MD
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        </ThemeProvider>
    );
}