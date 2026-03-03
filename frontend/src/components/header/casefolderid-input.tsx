import CircularProgress from "@mui/material/CircularProgress";
import {Box, Button, TextField, InputAdornment} from "@mui/material";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import {useStateCasefolderId} from "../../store/useStoreGetByCasefolderId.ts";
import {useState} from "react";
import {useStoreToggleSideBar} from "../../store/useStoreToggleSideBar.ts";

export const CasefolderidInput = () => {
    const setCaseFolderId = useStateCasefolderId((state) => state.setCasefolderId);
    const isLoading = useStateCasefolderId((state) => state.isLoading);
    const {openSidebar} = useStoreToggleSideBar();
    const [value, setValue] = useState<string>("");

    const handleSearch = () => {
        if (value.trim()) {
            setCaseFolderId(value);
            openSidebar();
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "fit-content",
                ml: "15%", // Păstrăm poziționarea cerută de tine
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                p: 0.5,
                borderRadius: '12px',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Loader-ul apare acum fluid în stânga */}
            <Box sx={{
                width: 24,
                display: 'flex',
                justifyContent: 'center',
                transition: 'opacity 0.3s',
                opacity: isLoading ? 1 : 0
            }}>
                <CircularProgress size={20} color="error"/>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(211, 47, 47, 0.2)", // Umbră roșiatică discretă
                    border: "1px solid",
                    borderColor: "divider",
                    "&:focus-within": {
                        borderColor: "error.main",
                        boxShadow: "0 0 12px rgba(211, 47, 47, 0.3)"
                    }
                }}
            >
                <TextField
                    placeholder="ID Dosar (Casefolder)..."
                    variant="standard"
                    size="small"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                        disableUnderline: true, // Scoatem linia de jos standard
                        sx: {
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.9rem',
                            width: "180px" // Puțin mai lat pentru lizibilitate
                        }
                    }}
                />

                <Button
                    variant="contained"
                    color="error"
                    onClick={handleSearch}
                    disabled={isLoading}
                    sx={{
                        borderRadius: 0,
                        minWidth: '50px',
                        height: '40px',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#b71c1c',
                            boxShadow: 'none'
                        }
                    }}
                >
                    <ManageSearchIcon/>
                </Button>
            </Box>
        </Box>
    );
};
