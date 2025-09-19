import { api, mikrotikApi } from "./api";

export interface MikrotikConnection {
  host: string;
  username: string;
  password: string;
  port?: number;
  secure?: boolean;
}

export interface MikrotikServer {
  id: string;
  name: string;
  host: string;
  username: string;
  password: string;
  port: number;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
  lastSyncAt?: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    clients: number;
  };
  connectionStatus?: "CONNECTED" | "DISCONNECTED";
  lastCheckedAt?: string;
  connectionError?: string;
}

export interface CreateMikrotikServerDto {
  name: string;
  host: string;
  username: string;
  password: string;
  port?: number;
  description?: string;
  location?: string;
}

export interface TestConnectionResponse {
  success: boolean;
  message: string;
  serverInfo?: {
    identity: string;
    version: string;
    uptime: string;
  };
}

export interface SyncResult {
  syncLogId: string;
  totalRecords: number;
  successfulRecords: number;
  errorRecords: number;
  errors: Array<{ username: string; error: string }>;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

// Test Mikrotik connection
export const testMikrotikConnection = async (
  connection: MikrotikConnection
): Promise<TestConnectionResponse> => {
  const response = await api.post("/mikrotik/test-connection", connection);
  return response.data?.data || response.data;
};

// Test connection to existing server
export const testServerConnection = async (
  serverId: string
): Promise<TestConnectionResponse> => {
  const response = await mikrotikApi.post(
    `/mikrotik/${serverId}/test-connection`
  );
  return response.data?.data || response.data;
};

// Add new Mikrotik server
export const addMikrotikServer = async (
  serverData: CreateMikrotikServerDto
): Promise<{
  server: MikrotikServer;
  importResult?: SyncResult;
  importError?: {
    message: string;
    error: string;
  };
}> => {
  const response = await api.post("/mikrotik", serverData);
  return response.data?.data;
};

// Get all Mikrotik servers
export const getMikrotikServers = async (): Promise<MikrotikServer[]> => {
  const response = await api.get("/mikrotik");
  return response.data?.data || [];
};

// Get all Mikrotik servers with real-time status
export const getMikrotikServersWithStatus = async (): Promise<
  MikrotikServer[]
> => {
  const response = await mikrotikApi.get("/mikrotik/with-status");
  return response.data?.data || [];
};

// Get Mikrotik server by ID
export const getMikrotikServer = async (
  id: string
): Promise<MikrotikServer> => {
  const response = await api.get(`/mikrotik/${id}`);
  return response.data?.data;
};

// Update Mikrotik server
export const updateMikrotikServer = async (
  id: string,
  serverData: Partial<CreateMikrotikServerDto>
): Promise<MikrotikServer> => {
  const response = await api.patch(`/mikrotik/${id}`, serverData);
  return response.data?.data;
};

// Delete Mikrotik server
export const deleteMikrotikServer = async (id: string): Promise<void> => {
  await api.delete(`/mikrotik/${id}`);
};

// Import users from Mikrotik
export const importUsersFromMikrotik = async (
  serverId: string
): Promise<SyncResult> => {
  const response = await api.post(`/mikrotik/${serverId}/import-users`);
  return response.data?.data;
};

// Sync clients with Mikrotik
export const syncClientsWithMikrotik = async (
  serverId: string
): Promise<SyncResult> => {
  const response = await api.post(`/mikrotik/${serverId}/sync-clients`);
  return response.data?.data;
};

// Get sync logs
export const getSyncLogs = async (serverId: string) => {
  const response = await api.get(`/mikrotik/${serverId}/sync-logs`);
  return response.data?.data;
};

// Get profiles from Mikrotik
export const getProfilesFromMikrotik = async (serverId: string) => {
  const response = await api.get(`/mikrotik/${serverId}/profiles`);
  return response.data?.data;
};

// Get active sessions from Mikrotik
export const getActiveSessionsFromMikrotik = async (serverId: string) => {
  const response = await api.get(`/mikrotik/${serverId}/active-sessions`);
  return response.data?.data;
};

// Check server connection status
export const checkServerStatus = async (serverId: string) => {
  const response = await mikrotikApi.get(`/mikrotik/${serverId}/status`);
  console.log("Raw API response:", response.data); // Debug log
  return response.data?.data || response.data;
};

// Check all server statuses in bulk
export const checkAllServerStatuses = async () => {
  const response = await api.post("/mikrotik/check-all-statuses");
  return response.data?.data;
};

// Toggle server enable/disable status
export const toggleServerStatus = async (serverId: string) => {
  const response = await api.patch(`/mikrotik/${serverId}/toggle-status`);
  return response.data?.data;
};
