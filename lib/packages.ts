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

/**
 * Fetch all PPPoE/Service Profiles (packages) from backend
 */
export const getPppoeProfiles = async (): Promise<ServiceProfile[]> => {
  const response = await api.get("/profiles");
  return response.data?.data || [];
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
