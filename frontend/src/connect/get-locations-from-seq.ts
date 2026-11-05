// connect/get-locations-from-seq.ts
import {isAxiosError} from "axios";
import {apiRequest} from "./api-client.ts";
import type {LocationItem} from "./types.ts";

// const normalizePhone = (raw: string) => {
//     const d = raw.replace(/\D/g, "");
//     return /^0\d{8}$/.test(d) ? d.slice(1) : d;
// };
const normalizePhone = (raw: string) => raw.replace(/\D/g, "").replace(/^0+/, "");

export const requestSeqLocations = async ({
                                              phone, caseFolderId, from, to,
                                          }: {
    phone: string;
    caseFolderId?: number;
    from?: string;
    to?: string
}): Promise<LocationItem[]> => {
    const digits = normalizePhone(phone);
    if (!/^\d{6,20}$/.test(digits)) throw new Error("Număr de telefon invalid");

    const params = new URLSearchParams({phone: digits});
    if (caseFolderId !== undefined) params.set("caseFolderId", String(caseFolderId));
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    try {
        return await apiRequest<LocationItem[]>(`/locations?${params}`, "GET");
    } catch (e) {
        throw new Error(isAxiosError(e) ? String(e.response?.data?.message ?? e.message) : "Eroare necunoscută");
    }
};

// // src/connect/get-locations-from-seq.ts
// import {isAxiosError} from "axios";
// import {apiRequest} from "./api-client.ts";
// import type {LocationItem} from "./types.ts";
//
// // "068 505 858" -> "68505858", "+373 68 505 858" -> "37368505858"
// const normalizePhone = (raw: string) => {
//     const d = raw.replace(/\D/g, "");
//     return /^0\d{8}$/.test(d) ? d.slice(1) : d;
// };
//
// export const requestSeqLocations = async (
//     phone: string,
//     caseFolderId: string,
//     from?: string | undefined,
//     to?: string | undefined,
// ): Promise<LocationItem[]> => {
//     const digits = normalizePhone(phone);
//     if (!/^\d{6,20}$/.test(digits)) throw new Error("Număr de telefon invalid");
//
//     const params = new URLSearchParams({phone: digits, caseFolderId});
//     if (from) params.set("from", from);
//     if (to) params.set("to", to);
//
//     try {
//         return await apiRequest<LocationItem[]>(`/locations?${params}`, "GET");
//     } catch (e) {
//         throw new Error(
//             isAxiosError(e) ? String(e.response?.data?.message ?? e.message) : "Eroare necunoscută",
//         );
//     }
// };