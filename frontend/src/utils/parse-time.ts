export const parseTime = (value: Date | string) => {
    const date = new Date(value);
    return date.toLocaleString("ro-RO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
