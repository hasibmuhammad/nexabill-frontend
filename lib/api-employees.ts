import { api } from "./api";

// ===== TYPES =====
export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone: string;
  designation: "ENGINEER" | "TECHNICIAN" | "BILL_COLLECTOR";
  salary?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  email?: string;
  phone: string;
  designation: Employee["designation"];
  salary?: string; // numeric string per backend
  isActive?: boolean;
}

export interface UpdateEmployeeDto {
  name?: string;
  email?: string;
  phone?: string;
  designation?: Employee["designation"];
  salary?: string; // numeric string per backend
  isActive?: boolean;
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

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ===== API FUNCTIONS =====

export const getEmployees = async (
  params: EmployeeListParams = {}
): Promise<ApiResponse<Employee[]>> => {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  const response = await api.get(`/employees?${searchParams.toString()}`);
  return response.data;
};

export const createEmployee = async (
  data: CreateEmployeeDto
): Promise<Employee> => {
  const response = await api.post("/employees", data);
  return response.data?.data;
};

export const updateEmployee = async (
  id: string,
  data: UpdateEmployeeDto
): Promise<Employee> => {
  const response = await api.patch(`/employees/${id}`, data);
  return response.data?.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await api.delete(`/employees/${id}`);
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await api.get(`/employees/${id}`);
  return response.data?.data;
};
