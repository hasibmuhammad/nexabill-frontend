import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

export const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 15000, // 15 seconds - reasonable for most operations
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth-token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Create a specific API instance for Mikrotik operations with extended timeout
export const mikrotikApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 60000, // 60 seconds - extended for Mikrotik operations that may take longer
});

// Add auth token to Mikrotik API requests
mikrotikApi.interceptors.request.use((config) => {
  const token = Cookies.get("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for Mikrotik API
mikrotikApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth-token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Create a specific API instance for real-time status with extended timeout
export const realTimeApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 45000, // 45 seconds for real-time status (multiple server connections)
});

// Add auth token to real-time API requests
realTimeApi.interceptors.request.use((config) => {
  const token = Cookies.get("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for real-time API
realTimeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth-token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Get real-time connection status from all Mikrotik servers
export const getRealTimeConnectionStatus = async () => {
  const response = await realTimeApi.get("/dashboard/real-time-status");
  // The API returns data nested under response.data.data
  return response.data.data || response.data;
};

// Get all Mikrotik servers for filter dropdown
export const getMikrotikServers = async () => {
  const response = await api.get("/mikrotik", {
    params: {
      page: 1,
      limit: 100, // Get all servers for filter dropdown
    },
  });
  return response.data?.data || [];
};
