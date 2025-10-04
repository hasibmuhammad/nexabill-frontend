import { api } from "./api";

export interface CreatedByUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface ServiceProfile {
  id: string;
  name: string;
  mikrotikProfile: string;
  monthlyPrice: string; // Prisma Decimal serialized as string
  description?: string | null;
  isActive: boolean;
  createdBy: CreatedByUserSummary;
  createdAt: string;
  updatedAt: string;
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

export interface ProfileListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Fetch all PPPoE/Service Profiles (packages) from backend
 */
export const getPppoeProfiles = async (): Promise<ServiceProfile[]> => {
  const response = await api.get("/profiles");
  return response.data?.data || [];
};

/**
 * Fetch PPPoE/Service Profiles with pagination and search
 */
export const getPppoeProfilesPaginated = async (
  params: ProfileListParams = {}
): Promise<ApiResponse<ServiceProfile[]>> => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append("page", params.page.toString());
  if (params.limit) searchParams.append("limit", params.limit.toString());
  if (params.search) searchParams.append("search", params.search);
  if (params.isActive !== undefined)
    searchParams.append("isActive", params.isActive.toString());

  console.log("🔍 API Profiles - Request params:", params);
  console.log("🔍 API Profiles - Search params:", searchParams.toString());

  const response = await api.get(`/profiles?${searchParams.toString()}`);

  console.log("🔍 API Profiles - Raw response:", response);
  console.log("🔍 API Profiles - Response data:", response.data);
  console.log(
    "🔍 API Profiles - Response data structure:",
    response.data?.data
  );

  return response.data;
};

// Backward-compatible alias: treat service profiles as packages in the UI
export type Package = ServiceProfile;
export const getPackages = async (): Promise<Package[]> => {
  return await getPppoeProfiles();
};

export interface CreateServiceProfileInput {
  name: string;
  mikrotikProfile: string;
  monthlyPrice: string; // keep as string to preserve precision
  description?: string;
  isActive?: boolean;
}

export type UpdateServiceProfileInput = Partial<CreateServiceProfileInput>;

export const createServiceProfile = async (
  data: CreateServiceProfileInput
): Promise<ServiceProfile> => {
  const response = await api.post("/profiles", data);
  return response.data?.data;
};

export const updateServiceProfile = async (
  id: string,
  data: UpdateServiceProfileInput
): Promise<ServiceProfile> => {
  const response = await api.patch(`/profiles/${id}`, data);
  return response.data?.data;
};

export const deleteServiceProfile = async (id: string): Promise<void> => {
  await api.delete(`/profiles/${id}`);
};

/**
 * Get clients that match a specific package's Mikrotik profile
 */
export const getMatchingClients = async (packageId: string) => {
  const response = await api.get(`/profiles/${packageId}/matching-clients`);
  return (
    response.data?.data || {
      package: null,
      matchingClients: [],
      assignedClients: [],
      totalMatches: 0,
      totalAssigned: 0,
    }
  );
};

/**
 * Assign multiple clients to a package
 */
export const assignClientsToPackage = async (
  packageId: string,
  clientIds: string[]
) => {
  const response = await api.post(`/profiles/${packageId}/assign-clients`, {
    clientIds,
  });
  return response.data?.data;
};

/**
 * Get package analytics showing client distribution
 */
export const getPackageAnalytics = async () => {
  const response = await api.get("/profiles/analytics/overview");
  return response.data?.data || [];
};

/**
 * Get unassigned clients grouped by Mikrotik profile
 */
export const getUnassignedClients = async () => {
  const response = await api.get("/profiles/unassigned-clients");
  return (
    response.data?.data || {
      unassignedClients: [],
      groupedByProfile: {},
      totalUnassigned: 0,
      profileGroups: [],
    }
  );
};

/**
 * Helper to coerce the string monthlyPrice to a number when needed
 */
export const getMonthlyPriceNumber = (
  profile: Pick<ServiceProfile, "monthlyPrice">
): number => {
  const parsed = Number(profile.monthlyPrice);
  return Number.isNaN(parsed) ? 0 : parsed;
};
