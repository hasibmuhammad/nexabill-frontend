import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.union([
    z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
    z.any() // Fallback for File objects
  ]).optional(),
  plan: z.enum(["TRIAL", "BASIC", "PREMIUM", "ENTERPRISE"]).default("TRIAL"),
  status: z.enum(["TRIAL", "ACTIVE", "INACTIVE", "SUSPENDED"]).default("TRIAL"),
  trialEndsAt: z.string().optional().or(z.literal("")),
  subscriptionEndsAt: z.string().optional().or(z.literal("")),
  settings: z.object({
    maxClients: z.coerce.number().int().min(1).default(100),
    maxUsers: z.coerce.number().int().min(1).default(5),
    maxMikrotikServers: z.coerce.number().int().min(1).default(3),
  }).default({
    maxClients: 100,
    maxUsers: 5,
    maxMikrotikServers: 3,
  }),
  features: z.object({
    analytics: z.boolean().default(true),
    reports: z.boolean().default(true),
    billing: z.boolean().default(true),
    clientManagement: z.boolean().default(true),
  }).default({
    analytics: true,
    reports: true,
    billing: true,
    clientManagement: true,
  }),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
