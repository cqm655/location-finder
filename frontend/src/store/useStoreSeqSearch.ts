// store/useStoreSeqSearch.ts
import {create} from "zustand";
import {requestSeqLocations} from "../connect/get-locations-from-seq.ts";
import type {LocationItem} from "../connect/types.ts";

export type SeqCaseState = {
    results: LocationItem[];
    loading: boolean;
    error: string | null;
    searched: boolean;
};

export const EMPTY_SEQ_CASE: SeqCaseState = {results: [], loading: false, error: null, searched: false};

type SeqSearchState = {
    byCase: Record<number, SeqCaseState>;
    search: (args: { caseFolderId: number; phone: string; from?: string; to?: string }) => Promise<void>;
    reset: (caseFolderId?: number) => void;
};

let counter = 0; // nu se repetă niciodată: un răspuns întârziat nu îl suprascrie pe cel nou
const latest = new Map<number, number>();

export const useStoreSeqSearch = create<SeqSearchState>((set) => {
    const patch = (id: number, p: Partial<SeqCaseState>) =>
        set((s) => ({byCase: {...s.byCase, [id]: {...(s.byCase[id] ?? EMPTY_SEQ_CASE), ...p}}}));

    return {
        byCase: {},

        search: async ({caseFolderId, phone, from, to}) => {
            const ticket = ++counter;
            latest.set(caseFolderId, ticket);
            patch(caseFolderId, {loading: true, error: null});

            try {
                const data = await requestSeqLocations({phone, caseFolderId, from, to});
                if (latest.get(caseFolderId) !== ticket) return;

                const sorted = [...data].sort(
                    (a, b) => new Date(b.timeUtc).getTime() - new Date(a.timeUtc).getTime(),
                );
                patch(caseFolderId, {results: sorted, loading: false, searched: true});
            } catch (e) {
                if (latest.get(caseFolderId) !== ticket) return;
                patch(caseFolderId, {
                    results: [],
                    loading: false,
                    searched: true,
                    error: e instanceof Error ? e.message : "Eroare la preluarea localizărilor SEQ.",
                });
            }
        },

        reset: (caseFolderId) => {
            if (caseFolderId === undefined) {
                latest.clear();
                set({byCase: {}});
                return;
            }
            latest.set(caseFolderId, ++counter);
            set((s) => {
                const next = {...s.byCase};
                delete next[caseFolderId];
                return {byCase: next};
            });
        },
    };
});

// import {create} from "zustand";
// import {requestSeqLocations} from "../connect/get-locations-from-seq.ts";
// import type {LocationItem} from "../connect/types.ts";
//
// type SearchArgs = {
//     phone: string;
//     caseFolderId: number;
//     from?: string; // ISO 8601, UTC
//     to?: string;
// };
//
// type SeqSearchState = {
//     caseFolderId: number | null; // cazul pentru care sunt rezultatele
//     results: LocationItem[];
//     loading: boolean;
//     error: string | null;
//     searched: boolean;
//     search: (args: SearchArgs) => Promise<void>;
//     reset: () => void;
// };
//
// const initialState = {
//     caseFolderId: null as number | null,
//     results: [] as LocationItem[],
//     loading: false,
//     error: null as string | null,
//     searched: false,
// };
//
// // contor care nu se repetă: un răspuns întârziat nu îl suprascrie pe cel nou
// let counter = 0;
// let current = 0;
//
// export const useStoreSeqSearch = create<SeqSearchState>((set) => ({
//     ...initialState,
//
//     search: async ({phone, caseFolderId, from, to}) => {
//         const ticket = ++counter;
//         current = ticket;
//
//         set({...initialState, loading: true});
//
//         try {
//             // validează numărul și aruncă „Număr de telefon invalid" dacă nu e bun
//             const data = await requestSeqLocations(phone, String(caseFolderId), from, to);
//
//             if (current !== ticket) return;
//
//             const sorted = [...data].sort(
//                 (a, b) => new Date(b.timeUtc).getTime() - new Date(a.timeUtc).getTime(),
//             );
//             set({results: sorted, loading: false, searched: true});
//         } catch (e) {
//             if (current !== ticket) return;
//             set({
//                 results: [],
//                 loading: false,
//                 searched: true,
//                 error: e instanceof Error ? e.message : "Eroare la preluarea localizărilor SEQ.",
//             });
//         }
//     },
//
//     reset: () => {
//         current = ++counter; // invalidează orice cerere în zbor
//         set(initialState);
//     },
// }));