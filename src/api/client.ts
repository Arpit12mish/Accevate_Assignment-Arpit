import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getSession, clearSession, isProbablyValidToken } from "../storage/secure";

/**
 * Axios instance for all API calls
 */
export const api = axios.create({
  baseURL: "https://aapsuj.accevate.co/flutter-api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Identify endpoints that DO NOT require auth
 */
const PUBLIC_ENDPOINTS = ["/login.php", "/verify_otp.php"];

/**
 * Request interceptor
 * - Attach Bearer token
 * - Block protected calls if session invalid
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url || "";

    // Check if endpoint is public
    const isPublic = PUBLIC_ENDPOINTS.some((e) => url.includes(e));

    if (!isPublic) {
      const session = await getSession();

      // No session -> block request early
      if (!session || !isProbablyValidToken(session.token)) {
        return Promise.reject({
          isAuthError: true,
          message: "Session missing or invalid",
        });
      }

      config.headers.Authorization = `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor
 * - Auto-logout on 401/403
 * - Normalize API errors
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const status = error.response?.status;

    // Unauthorized or Forbidden → session invalid
    if (status === 401 || status === 403) {
      await clearSession();

      return Promise.reject({
        isAuthError: true,
        message: "Session expired. Please login again.",
      });
    }

    // Custom API error normalization
    const apiMessage =
      (error.response?.data as any)?.msg ||
      error.message ||
      "Unexpected error occurred";

    return Promise.reject({
      isApiError: true,
      message: apiMessage,
      status,
    });
  }
);
