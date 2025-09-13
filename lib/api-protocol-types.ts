import { api } from "./api";

// ===== TYPES =====

export interface ProtocolType {
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

export interface ProtocolTypeListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface CreateProtocolTypeDto {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProtocolTypeDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

// Get all protocol types with pagination and search
export const getProtocolTypes = async (
  params: ProtocolTypeListParams = {}
): Promise<ApiResponse<ProtocolType[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  console.log("🔍 API Protocol Types - Request params:", params);
  console.log(
    "🔍 API Protocol Types - Search params:",
    searchParams.toString()
  );

  const response = await api.get(`/protocol-types?${searchParams.toString()}`);

  console.log("🔍 API Protocol Types - Raw response:", response);
  console.log("🔍 API Protocol Types - Response data:", response.data);
  console.log(
    "🔍 API Protocol Types - Response data structure:",
    response.data?.data
  );

  return response.data;
};

// Get all active protocol types (for dropdowns)
export const getActiveProtocolTypes = async (): Promise<
  ApiResponse<ProtocolType[]>
> => {
  return getProtocolTypes({ isActive: true, limit: 1000 });
};

// Get single protocol type by ID
export const getProtocolType = async (
  id: string
): Promise<ApiResponse<ProtocolType>> => {
  const response = await api.get(`/protocol-types/${id}`);
  return response.data;
};

// Create new protocol type
export const createProtocolType = async (
  data: CreateProtocolTypeDto
): Promise<ApiResponse<ProtocolType>> => {
  const response = await api.post("/protocol-types", data);
  return response.data;
};

// Update protocol type
export const updateProtocolType = async (
  id: string,
  data: UpdateProtocolTypeDto
): Promise<ApiResponse<ProtocolType>> => {
  const response = await api.patch(`/protocol-types/${id}`, data);
  return response.data;
};

// Delete protocol type
export const deleteProtocolType = async (
  id: string
): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/protocol-types/${id}`);
  return response.data;
};

// Toggle protocol type status
export const toggleProtocolTypeStatus = async (
  id: string
): Promise<ApiResponse<ProtocolType>> => {
  const response = await api.patch(`/protocol-types/${id}/toggle-status`);
  return response.data;
};
