import { api } from "./api";
import { SubscriptionPlan } from "./schemas/plan";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  plan: SubscriptionPlan;
  status: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  settings?: {
    maxClients: number;
    maxUsers: number;
    maxMikrotikServers: number;
  };
  features?: {
    analytics: boolean;
    reports: boolean;
    billing: boolean;
    clientManagement: boolean;
  };
  licenseNumber?: string;
  binNumber?: string;
  tinNumber?: string;
  ispCategory?: string;
  username?: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
    clients: number;
    serviceProfiles: number;
    mikrotikServers: number;
  };
}

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
  domain?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  plan?: string;
  status?: string;
  trialEndsAt?: string;
  subscriptionEndsAt?: string;
  settings?: {
    maxClients: number;
    maxUsers: number;
    maxMikrotikServers: number;
  };
  features?: {
    analytics: boolean;
    reports: boolean;
    billing: boolean;
    clientManagement: boolean;
  };
  licenseNumber?: string;
  binNumber?: string;
  tinNumber?: string;
  ispCategory?: string;
  clientPrefix?: string;
  currency?: string;
  timezone?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {}

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

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
}

export interface OrganizationAnalytics {
  organization: {
    id: string;
    name: string;
    status: string;
    plan: string;
  };
  counts: {
    users: number;
    clients: number;
    serviceProfiles: number;
    mikrotikServers: number;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt?: string;
  }>;
  clients: Array<{
    id: string;
    name: string;
    status: string;
    connectionStatus: string;
    monthlyFee: number;
  }>;
  summary: {
    totalRevenue: number;
    activeUsers: number;
    connectedClients: number;
  };
}

export const organizationsApi = {
  // Get all organizations with pagination and filters
  getAll: async (
    params: OrganizationListParams = {}
  ): Promise<ApiResponse<Organization[]>> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append("page", params.page.toString());
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.search) searchParams.append("search", params.search);
    if (params.status && params.status !== "ALL")
      searchParams.append("status", params.status);
    if (params.plan && params.plan !== "ALL")
      searchParams.append("plan", params.plan);

    const response = await api.get(`/organizations?${searchParams.toString()}`);
    return response.data;
  },

  // Get organization by ID
  getById: async (id: string): Promise<ApiResponse<Organization>> => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  // Create new organization
  create: async (
    data: CreateOrganizationDto
  ): Promise<ApiResponse<Organization>> => {
    const response = await api.post("/organizations", data);
    return response.data;
  },

  // Update organization
  update: async (
    id: string,
    data: UpdateOrganizationDto
  ): Promise<ApiResponse<Organization>> => {
    const response = await api.patch(`/organizations/${id}`, data);
    return response.data;
  },

  // Delete organization
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/organizations/${id}`);
    return response.data;
  },

  // Toggle organization status
  toggleStatus: async (id: string): Promise<ApiResponse<Organization>> => {
    const response = await api.patch(`/organizations/${id}/toggle-status`);
    return response.data;
  },

  // Get organization analytics
  getAnalytics: async (
    id: string
  ): Promise<ApiResponse<OrganizationAnalytics>> => {
    const response = await api.get(`/organizations/${id}/analytics`);
    return response.data;
  },
};
