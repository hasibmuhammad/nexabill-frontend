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
 * Helper to coerce the string monthlyPrice to a number when needed
 */
export const getMonthlyPriceNumber = (
  profile: Pick<ServiceProfile, "monthlyPrice">
): number => {
  const parsed = Number(profile.monthlyPrice);
  return Number.isNaN(parsed) ? 0 : parsed;
};
