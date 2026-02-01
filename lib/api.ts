import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

// Constants for cookie keys
const ACCESS_TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "refresh-token";

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Shared helper to configure interceptors for an axios instance
 */
const setupInterceptors = (instance: AxiosInstance) => {
  // Request interceptor: Attach Access Token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = Cookies.get(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle 401 and Token Refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      // Handle Network Errors (e.g., CORS mismatch or Server Down)
      // If we have tokens but the critical auth requests fail with a network error,
      // it's likely a stale/domain-mismatched token that needs clearing.
      if (!error.response) {
        const isAuthRequest = originalRequest.url?.includes("/auth/profile") || 
                            originalRequest.url?.includes("/auth/refresh");
                            
        if (isAuthRequest && (Cookies.get(ACCESS_TOKEN_KEY) || Cookies.get(REFRESH_TOKEN_KEY))) {
          console.warn("Network Error on auth endpoint. Clearing session.");
          clearAuthCookies();
          // We don't force redirect here to allow the calling component (like AuthContext)
          // to handle the UI state transition gracefully.
        }
        return Promise.reject(error);
      }

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Add to queue and wait for the refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return instance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = Cookies.get(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          isRefreshing = false;
          handleLogout();
          return Promise.reject(error);
        }

        try {
          // Attempt to refresh the token
          // Note: We use a fresh axios instance here to avoid recursive interceptors
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/auth/refresh`,
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );

          const { access_token, refresh_token } = response.data.data || response.data;

          // Update cookies
          Cookies.set(ACCESS_TOKEN_KEY, access_token, { expires: 1 }); // 1 day for access (redundant as it's auto-rotated)
          Cookies.set(REFRESH_TOKEN_KEY, refresh_token, { expires: 7 }); // 7 days for refresh

          isRefreshing = false;
          processQueue(null, access_token);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return instance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError as Error, null);
          handleLogout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Centralized function to clear authentication session
 */
export const clearAuthCookies = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const handleLogout = () => {
  clearAuthCookies();
  if (typeof window !== "undefined") {
    // Check if we are already on the login page to avoid loops
    if (!window.location.pathname.startsWith("/auth/login")) {
      window.location.href = "/auth/login";
    }
  }
};

// --- API Instances ---

// Standard API instance
export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 15000,
});
setupInterceptors(api);

// Mikrotik API instance (Extended Timeout)
export const mikrotikApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 60000,
});
setupInterceptors(mikrotikApi);

// Real-time API instance
export const realTimeApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 45000,
});
setupInterceptors(realTimeApi);

// Explicit Export for legacy support if needed
export default api;

// --- Specialized Fetchers ---

export const getRealTimeConnectionStatus = async () => {
  const response = await realTimeApi.get("/dashboard/real-time-status");
  return response.data.data || response.data;
};

export const getMikrotikServers = async () => {
  const response = await api.get("/mikrotik", {
    params: { page: 1, limit: 100 },
  });
  return response.data?.data || [];
};
