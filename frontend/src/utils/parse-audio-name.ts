interface ParsedAudioName {
    date: string;      // ex: "24.03.2026"
    time: string;      // ex: "09:57:43"
    operator: string;  // ex: "Nicolai Lazari"
    workstation: string; // ex: "WS-C2-02"
}

export const parseAudioFileName = (filePath: string): ParsedAudioName | null => {
    if (!filePath) return null;

    // Extragere nume fișier din cale (funcționează și cu \ și cu /)
    const fileName = filePath.split(/[\\/]/).pop() || "";

    // Regex pentru structura: YYYY-MM-DD_HHMMSSmmm_prenume.nume_STATIE_GUID.mp3
    const regex = /^(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})(\d{2})\d*_([^_]+)_([^_]+)_/i;
    const match = fileName.match(regex);

    if (!match) {
        return null;
    }

    const [, rawDate, hours, minutes, seconds, rawOperator, workstation] = match;

    // Formatare dată din YYYY-MM-DD în DD.MM.YYYY
    const [year, month, day] = rawDate.split("-");
    const formattedDate = `${day}.${month}.${year}`;

    // Formatare timp: HH:mm:ss
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    // Formatare nume operator (ex: "nicolai.lazari" -> "Nicolai Lazari")
    const formattedOperator = rawOperator
        .split(".")
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    return {
        date: formattedDate,
        time: formattedTime,
        operator: formattedOperator,
        workstation: workstation,
    };
};