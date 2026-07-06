import axios, { AxiosInstance } from "axios";
import { getToken } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sashapay-1.onrender.com";

class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: { "Content-Type": "application/json" },
    });

    this.instance.interceptors.request.use((config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Distinguish "server responded with an error" from "request never
        // reached the server" — the latter should never show axios's raw
        // internal message (e.g. "Network Error") to the user.
        const message = error.response
          ? error.response.data?.message || `API error ${error.response.status}`
          : "Could not connect to server. Please try again.";
        return Promise.reject(new Error(message));
      }
    );
  }

  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return this.instance.get<T>(url, { params }).then((res) => res.data);
  }

  post<T>(url: string, body?: unknown): Promise<T> {
    return this.instance.post<T>(url, body).then((res) => res.data);
  }

  patch<T>(url: string, body?: unknown): Promise<T> {
    return this.instance.patch<T>(url, body).then((res) => res.data);
  }

  delete<T>(url: string): Promise<T> {
    return this.instance.delete<T>(url).then((res) => res.data);
  }
}

export const apiClient = new ApiClient(BASE_URL);
