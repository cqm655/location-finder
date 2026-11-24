import {create} from "zustand";
import {normalizePhone, requestSeqLocations} from "../connect/get-locations-from-seq.ts";
import type {LocationItem} from "../connect/types.ts";

export type SeqCaseState = {
    results: LocationItem[];
    loading: boolean;
    error: string | null;
    searched: boolean;
};

export const EMPTY_SEQ_CASE: SeqCaseState = {results: [], loading: false, error: null, searched: false};

export const seqKey = (caseFolderId: number, phone?: string | null) =>
    `${caseFolderId}:${normalizePhone(phone ?? "")}`;

type SeqSearchState = {
    byKey: Record<string, SeqCaseState>;
    search: (args: { caseFolderId: number; phone: string; from?: string; to?: string }) => Promise<void>;
    reset: (key?: string) => void;
};

let counter = 0; // nu se repetă: un răspuns întârziat nu îl suprascrie pe cel nou
const latest = new Map<string, number>();

export const useStoreSeqSearch = create<SeqSearchState>((set) => {
    const patch = (key: string, p: Partial<SeqCaseState>) =>
        set((s) => ({byKey: {...s.byKey, [key]: {...(s.byKey[key] ?? EMPTY_SEQ_CASE), ...p}}}));

    return {
        byKey: {},

        search: async ({caseFolderId, phone, from, to}) => {
            const key = seqKey(caseFolderId, phone);
            const ticket = ++counter;
            latest.set(key, ticket);
            patch(key, {loading: true, error: null});

            try {
                const data = await requestSeqLocations({phone, caseFolderId, from, to});
                if (latest.get(key) !== ticket) return;

                const sorted = [...data].sort(
                    (a, b) => new Date(b.timeUtc).getTime() - new Date(a.timeUtc).getTime(),
                );
                patch(key, {results: sorted, loading: false, searched: true});
            } catch (e) {
                if (latest.get(key) !== ticket) return;
                patch(key, {
                    results: [],
                    loading: false,
                    searched: true,
                    error: e instanceof Error ? e.message : "Eroare la preluarea localizărilor SEQ.",
                });
            }
        },

        reset: (key) => {
            if (key === undefined) {
                latest.clear();
                set({byKey: {}});
                return;
            }
            latest.set(key, ++counter);
            set((s) => {
                const next = {...s.byKey};
                delete next[key];
                return {byKey: next};
            });
        },
    };
});