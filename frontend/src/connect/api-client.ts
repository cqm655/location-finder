import axios, {type AxiosInstance, type AxiosResponse} from "axios";
import type {ApiCaseFolderIdResponse} from "./types.ts";

const apiClient: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3004/by-location',
    headers: {'Content-Type': 'application/json'}
})

export const apiRequest = async <T>(url: string, method: "GET" | "POST" | "PUT" | "DELETE", data?: ApiCaseFolderIdResponse): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient({
        method,
        url,
        data
    });

    return response.data;
}