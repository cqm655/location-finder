// "068 505 858" -> "68505858" | "0865029057211660" -> "865029057211660"
import type {LocationItem} from "./types.ts";
import {apiRequest} from "./api-client.ts";
import {isAxiosError} from "axios";

export const normalizePhone = (raw: string) => raw.replace(/\D/g, "").replace(/^0+/, "");

export const requestSeqLocations = async ({
                                              phone, caseFolderId, from, to,
                                          }: {
    phone: string;
    caseFolderId?: number;
    from?: string;
    to?: string
}): Promise<LocationItem[]> => {
    const params = new URLSearchParams({phone: normalizePhone(phone)});
    if (caseFolderId !== undefined) params.set("caseFolderId", String(caseFolderId));
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    try {
        return await apiRequest<LocationItem[]>(`/locations?${params}`, "GET");
    } catch (e) {
        throw new Error(isAxiosError(e) ? String(e.response?.data?.message ?? e.message) : "Eroare necunoscută");
    }
};