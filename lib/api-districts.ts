import { api } from "./api";

// ===== TYPES =====
export interface District {
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
}

export interface CreateDistrictDto {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateDistrictDto {
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

export interface DistrictListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

// Get all districts with pagination and search
export const getDistricts = async (
  params: DistrictListParams = {}
): Promise<ApiResponse<District[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  console.log("🔍 API Districts - Request params:", params);
  console.log("🔍 API Districts - Search params:", searchParams.toString());

  const response = await api.get(`/districts?${searchParams.toString()}`);

  console.log("🔍 API Districts - Raw response:", response);
  console.log("🔍 API Districts - Response data:", response.data);
  console.log(
    "🔍 API Districts - Response data structure:",
    response.data?.data
  );

  return response.data;
};

// Get all active districts (for dropdowns)
export const getActiveDistricts = async (): Promise<District[]> => {
  const response = await api.get("/districts?isActive=true&limit=1000");
  return response.data?.data || [];
};

// Get all districts for dropdown (without pagination)
export const getAllDistrictsForDropdown = async (): Promise<District[]> => {
  const response = await api.get("/districts/bangladesh-list");
  return response.data?.data || [];
};

// Get district by ID
export const getDistrictById = async (id: string): Promise<District> => {
  const response = await api.get(`/districts/${id}`);
  return response.data?.data;
};

// Create new district
export const createDistrict = async (
  data: CreateDistrictDto
): Promise<District> => {
  const response = await api.post("/districts", data);
  return response.data?.data;
};

// Update district
export const updateDistrict = async (
  id: string,
  data: UpdateDistrictDto
): Promise<District> => {
  const response = await api.patch(`/districts/${id}`, data);
  return response.data?.data;
};

// Delete district
export const deleteDistrict = async (id: string): Promise<void> => {
  await api.delete(`/districts/${id}`);
};

// Toggle district status
export const toggleDistrictStatus = async (id: string): Promise<District> => {
  const response = await api.patch(`/districts/${id}/toggle-status`);
  return response.data?.data;
};
