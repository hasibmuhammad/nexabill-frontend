import { api } from "./api";

// ===== TYPES =====
export interface Subzone {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  zoneId: string;
  zone: {
    id: string;
    name: string;
    code?: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubzoneDto {
  name: string;
  code?: string;
  description?: string;
  zoneId: string;
}

export interface UpdateSubzoneDto {
  name?: string;
  code?: string;
  description?: string;
  zoneId?: string;
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

export interface SubzoneListParams {
  page?: number;
  limit?: number;
  search?: string;
  zoneId?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

// Get all subzones with pagination and search
export const getSubzones = async (
  params: SubzoneListParams = {}
): Promise<ApiResponse<Subzone[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.zoneId) searchParams.append("zoneId", params.zoneId);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  const response = await api.get(`/subzones?${searchParams.toString()}`);
  return response.data;
};

// Get subzone by ID
export const getSubzoneById = async (id: string): Promise<Subzone> => {
  const response = await api.get(`/subzones/${id}`);
  return response.data?.data;
};

// Create new subzone
export const createSubzone = async (
  data: CreateSubzoneDto
): Promise<Subzone> => {
  const response = await api.post("/subzones", data);
  return response.data?.data;
};

// Update subzone
export const updateSubzone = async (
  id: string,
  data: UpdateSubzoneDto
): Promise<Subzone> => {
  const response = await api.patch(`/subzones/${id}`, data);
  return response.data?.data;
};

// Delete subzone
export const deleteSubzone = async (id: string): Promise<void> => {
  await api.delete(`/subzones/${id}`);
};

// Toggle subzone status
export const toggleSubzoneStatus = async (id: string): Promise<Subzone> => {
  const response = await api.patch(`/subzones/${id}/toggle-status`);
  return response.data?.data;
};
