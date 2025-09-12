import { api } from "./api";

// ===== TYPES =====
export interface Zone {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    subzones: number;
  };
}

export interface CreateZoneDto {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateZoneDto {
  name?: string;
  code?: string;
  description?: string;
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

export interface ZoneListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

// Get all zones with pagination and search
export const getZones = async (
  params: ZoneListParams = {}
): Promise<ApiResponse<Zone[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  const response = await api.get(`/zones?${searchParams.toString()}`);
  return response.data;
};

// Get zone by ID
export const getZoneById = async (id: string): Promise<Zone> => {
  const response = await api.get(`/zones/${id}`);
  return response.data?.data;
};

// Create new zone
export const createZone = async (data: CreateZoneDto): Promise<Zone> => {
  const response = await api.post("/zones", data);
  return response.data?.data;
};

// Update zone
export const updateZone = async (
  id: string,
  data: UpdateZoneDto
): Promise<Zone> => {
  const response = await api.patch(`/zones/${id}`, data);
  return response.data?.data;
};

// Delete zone
export const deleteZone = async (id: string): Promise<void> => {
  await api.delete(`/zones/${id}`);
};

// Toggle zone status
export const toggleZoneStatus = async (id: string): Promise<Zone> => {
  const response = await api.patch(`/zones/${id}/toggle-status`);
  return response.data?.data;
};
