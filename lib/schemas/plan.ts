import { z } from "zod";

export const billingCycleEnum = z.enum(["MONTHLY", "YEARLY"]);
export const supportLevelEnum = z.enum(["BASIC", "PRIORITY", "DEDICATED"]);

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  
  // Physical Limits
  maxClients: z.coerce.number().int().min(1, "Must allow at least 1 client"),
  maxMikrotikServers: z.coerce.number().int().min(1, "Must allow at least 1 server"),
  
  // Pricing
  basePrice: z.coerce.number().min(0, "Price cannot be negative"),
  setupFee: z.coerce.number().min(0, "Setup fee cannot be negative").default(0),
  pricePerExtraClient: z.coerce.number().min(0, "Extra client price cannot be negative").default(0),
  billingCycle: billingCycleEnum.default("MONTHLY"),
  
  // Feature Flags
  isWhiteLabelEnabled: z.boolean().default(false),
  hasAdvancedAnalytics: z.boolean().default(false),
  hasAPI: z.boolean().default(false),
  hasAutomatedReporting: z.boolean().default(false),
  hasRadiusSupport: z.boolean().default(false),
  
  // Support
  supportLevel: supportLevelEnum.default("BASIC"),
  
  isActive: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planSchema>;

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  maxClients: number;
  maxMikrotikServers: number;
  basePrice: number;
  setupFee: number;
  pricePerExtraClient: number;
  billingCycle: string;
  isWhiteLabelEnabled: boolean;
  hasAdvancedAnalytics: boolean;
  hasAPI: boolean;
  hasAutomatedReporting: boolean;
  hasRadiusSupport: boolean;
  supportLevel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
