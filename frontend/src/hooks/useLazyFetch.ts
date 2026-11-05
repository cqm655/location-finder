import {useCallback, useRef, useState} from "react";

export interface LazyFetchState<T> {
    data: T[] | null;
    loading: boolean;
    error: string | null;
    load: (fetcher: () => Promise<T[]>) => Promise<void>;
}

export function useLazyFetch<T>(): LazyFetchState<T> {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const busy = useRef(false);
    const loaded = useRef(false);

    const load = useCallback(async (fetcher: () => Promise<T[]>) => {
        if (busy.current || loaded.current) return; // deja în curs sau deja încărcat
        busy.current = true;
        setLoading(true);
        setError(null);

        try {
            const resp = await fetcher();
            setData(Array.isArray(resp) ? resp : []);
            loaded.current = true;
        } catch (err) {
            console.error("Eroare la preluarea datelor:", err);
            setError(err instanceof Error ? err.message : "Eroare necunoscută la încărcare.");
        } finally {
            busy.current = false;
            setLoading(false);
        }
    }, []);

    return {data, loading, error, load};
}