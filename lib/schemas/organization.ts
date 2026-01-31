import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
  email: z.string().email("Invalid email format").min(1, "Organization email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.union([
    z.string().url("Logo must be a valid URL").optional().or(z.literal("")),
    z.any() // Fallback for File objects
  ]).optional(),
  plan: z.enum(["TRIAL", "BASIC", "PREMIUM", "ENTERPRISE"]),
  status: z.enum(["TRIAL", "ACTIVE", "INACTIVE", "SUSPENDED"]),
  trialEndsAt: z.string().optional().or(z.literal("")),
  subscriptionEndsAt: z.string().optional().or(z.literal("")),
  settings: z.object({
    maxClients: z.coerce.number().int().min(1),
    maxUsers: z.coerce.number().int().min(1),
    maxMikrotikServers: z.coerce.number().int().min(1),
  }),
  features: z.object({
    analytics: z.boolean(),
    reports: z.boolean(),
    billing: z.boolean(),
    clientManagement: z.boolean(),
  }),
  // ISP / Business Details
  licenseNumber: z.string().optional().or(z.literal("")),
  binNumber: z.string().optional().or(z.literal("")),
  tinNumber: z.string().optional().or(z.literal("")),
  ispCategory: z.string().optional().or(z.literal("")),
  username: z.string().min(3, "Organization username is required"),
  password: z.string().min(6, "Organization password is required"),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
