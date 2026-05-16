import axios from "axios";
import { useAuth } from "@clerk/expo";
import { useCallback } from "react";

const API_URL =
  (process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000") + "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}`
      );
    } else if (error.request) {
      console.warn("API request failed – no response from server");
    }
    return Promise.reject(error);
  }
);

export const useApi = () => {
  const { getToken } = useAuth();

  const apiWithAuth = useCallback(
    async <T>(config: Parameters<typeof api.request>[0]) => {
      const token = await getToken();
      return api.request<T>({
        ...config,
        headers: {
          ...config.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    },
    [getToken]
  );

  return { api, apiWithAuth };
};
