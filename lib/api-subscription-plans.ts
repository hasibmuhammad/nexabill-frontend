import { api } from "./api";
import { SubscriptionPlan } from "./schemas/plan";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export const subscriptionPlansApi = {
  getAll: async (params: any = {}): Promise<ApiResponse<SubscriptionPlan[]>> => {
    const response = await api.get("/subscription-plans", { params });
    return response.data;
  },
  getById: async (id: string): Promise<ApiResponse<SubscriptionPlan>> => {
    const response = await api.get(`/subscription-plans/${id}`);
    return response.data;
  },
};
