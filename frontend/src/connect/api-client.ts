import axios, {type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig} from "axios";
import type {ApiCaseFolderIdResponse} from "./types.ts";

const apiClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3004',
    headers: {'Content-Type': 'application/json'}
})

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem("access_token");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Dacă backend-ul returnează 401 Unauthorized (token expirat / invalid)
        if (error.response && error.response.status === 401) {
            console.warn("Sesiunea a expirat. Redirecționare la login...");

            // Curățăm stocarea locală
            sessionStorage.removeItem("access_token");

            // Redirecționăm forțat la /login dacă nu suntem deja acolo
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    })

export const apiRequest = async <T>(url: string, method: "GET" | "POST" | "PUT" | "DELETE", data?: ApiCaseFolderIdResponse, responseType?: 'json' | 'blob' | 'arraybuffer'): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient({
        method,
        url,
        data,
        responseType
    });

    return response.data;
}
