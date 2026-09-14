import { Pagination } from "@/types/pagination";
import { InternalAxiosRequestConfig } from "axios";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export interface Response {
    statusCode: number;
    message: string;
}

export interface ErrorResponse {
    statusCode: number;
    message: string[];
    error: string; /// Bad Request, Forbidden, Unauthorized, etc.
}

export interface SuccessResponse<T> extends Response {
    result: T;
    pagination?: Pagination;
}
