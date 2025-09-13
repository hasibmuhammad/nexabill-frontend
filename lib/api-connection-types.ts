import { api } from "./api";

// ===== TYPES =====

export interface ConnectionType {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  clients?: Array<{
    id: string;
    name: string;
    trackCode: string;
  }>;
  _count?: {
    clients: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

export interface ConnectionTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateConnectionTypeDto {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateConnectionTypeDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

// Get all connection types with pagination and search
export const getConnectionTypes = async (
  params: ConnectionTypeListParams = {}
): Promise<ApiResponse<ConnectionType[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  console.log("🔍 API Connection Types - Request params:", params);
  console.log(
    "🔍 API Connection Types - Search params:",
    searchParams.toString()
  );

  const response = await api.get(
    `/connection-types?${searchParams.toString()}`
  );

  console.log("🔍 API Connection Types - Raw response:", response);
  console.log("🔍 API Connection Types - Response data:", response.data);
  console.log(
    "🔍 API Connection Types - Response data structure:",
    response.data?.data
  );

  return response.data;
};

// Get all active connection types (for dropdowns)
export const getActiveConnectionTypes = async (): Promise<
  ApiResponse<ConnectionType[]>
> => {
  return getConnectionTypes({ isActive: true, limit: 1000 });
};

// Get single connection type by ID
export const getConnectionType = async (
  id: string
): Promise<ApiResponse<ConnectionType>> => {
  const response = await api.get(`/connection-types/${id}`);
  return response.data;
};

// Create new connection type
export const createConnectionType = async (
  data: CreateConnectionTypeDto
): Promise<ApiResponse<ConnectionType>> => {
  const response = await api.post("/connection-types", data);
  return response.data;
};

// Update connection type
export const updateConnectionType = async (
  id: string,
  data: UpdateConnectionTypeDto
): Promise<ApiResponse<ConnectionType>> => {
  const response = await api.patch(`/connection-types/${id}`, data);
  return response.data;
};

// Delete connection type
export const deleteConnectionType = async (
  id: string
): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/connection-types/${id}`);
  return response.data;
};

// Toggle connection type status
export const toggleConnectionTypeStatus = async (
  id: string
): Promise<ApiResponse<ConnectionType>> => {
  const response = await api.patch(`/connection-types/${id}/toggle-status`);
  return response.data;
};
