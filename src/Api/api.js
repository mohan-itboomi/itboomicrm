import axios from "axios";
import { clearAuthSession, getRefreshToken, refreshAuthSession } from "./authSession";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("acesstoken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) console.debug("API request", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    const isRefreshRequest = error.config?.url?.includes("/auth/refresh-tokens");
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isLoginRequest &&
      !isRefreshRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          await refreshAuthSession();
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem("acesstoken")}`;
          return api(originalRequest);
        } catch {
          clearAuthSession();
        }
      } else {
        clearAuthSession();
      }
      if (window.location.pathname !== "/login") window.location.replace("/login");
    }
    if (import.meta.env.DEV) console.error("API error", error.response?.status, error.response?.data);
    return Promise.reject(error);
  },
);

export default api;
