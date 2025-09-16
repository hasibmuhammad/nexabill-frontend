import { api } from "./api";

// ===== TYPES =====
export interface Upazila {
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
    clients: number;
  };
}

export interface CreateUpazilaDto {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateUpazilaDto {
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

export interface UpazilaListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

// Get all upazilas with pagination and search
export const getUpazilas = async (
  params: UpazilaListParams = {}
): Promise<ApiResponse<Upazila[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  console.log("🔍 API Upazilas - Request params:", params);
  console.log("🔍 API Upazilas - Search params:", searchParams.toString());

  const response = await api.get(`/upazilas?${searchParams.toString()}`);

  console.log("🔍 API Upazilas - Raw response:", response);
  console.log("🔍 API Upazilas - Response data:", response.data);
  console.log(
    "🔍 API Upazilas - Response data structure:",
    response.data?.data
  );

  return response.data;
};

// Get all active upazilas (for dropdowns)
export const getActiveUpazilas = async (): Promise<Upazila[]> => {
  const searchParams = new URLSearchParams();
  searchParams.append("isActive", "true");
  searchParams.append("limit", "1000");

  const response = await api.get(`/upazilas?${searchParams.toString()}`);
  return response.data?.data || [];
};

// Get upazila by ID
export const getUpazilaById = async (id: string): Promise<Upazila> => {
  const response = await api.get(`/upazilas/${id}`);
  return response.data?.data;
};

// Create new upazila
export const createUpazila = async (
  data: CreateUpazilaDto
): Promise<Upazila> => {
  const response = await api.post("/upazilas", data);
  return response.data?.data;
};

// Update upazila
export const updateUpazila = async (
  id: string,
  data: UpdateUpazilaDto
): Promise<Upazila> => {
  const response = await api.patch(`/upazilas/${id}`, data);
  return response.data?.data;
};

// Delete upazila
export const deleteUpazila = async (id: string): Promise<void> => {
  await api.delete(`/upazilas/${id}`);
};

// Toggle upazila status
export const toggleUpazilaStatus = async (id: string): Promise<Upazila> => {
  const response = await api.patch(`/upazilas/${id}/toggle-status`);
  return response.data?.data;
};
