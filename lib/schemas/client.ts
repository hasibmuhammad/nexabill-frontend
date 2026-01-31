import { z } from "zod";

export const clientSchema = z.object({
  // Basic Info
  name: z.string().min(1, "Name is required"),
  nid: z.string().min(1, "NID is required"),
  nidPicture: z.any().optional(),
  registrationFormNo: z.string().optional(),
  registrationFormPicture: z.any().optional(),

  // Contact Info
  mobileNumber: z.string().min(1, "Mobile number is required").regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, "Invalid Bangladeshi mobile number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  districtId: z.string().min(1, "District is required"),
  upazilaId: z.string().min(1, "Upazila is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),

  // Network/Product Info
  mikrotikServerId: z.string().min(1, "Server is required"),
  protocolTypeId: z.string().min(1, "Protocol type is required"),
  zoneId: z.string().min(1, "Zone is required"),
  subzoneId: z.string().optional(),
  connectionTypeId: z.string().min(1, "Connection type is required"),
  cableRequirement: z.string().optional(),
  fiberCode: z.string().optional(),
  numberOfCore: z.string().optional(),
  coreColor: z.string().optional(),

  // Service Info
  trackCode: z.string().min(1, "Track code is required"),
  serviceProfileId: z.string().min(1, "Package is required"),
  clientType: z.enum(["HOME", "CORPORATE"]),
  billingStatus: z.string().min(1, "Billing status is required"),
  mikrotikUsername: z.string().min(1, "Username/IP is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  joiningDate: z.string().min(1, "Joining date is required"),
  billingCycle: z.number().nullable().optional(),
  referenceBy: z.string().optional(),
  isVipClient: z.boolean().default(false),
  connectedBy: z.string().optional(),
  assignTo: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

// Helpers for step-wise validation
export const basicInfoSchema = clientSchema.pick({
  name: true,
  nid: true,
  nidPicture: true,
  registrationFormNo: true,
  registrationFormPicture: true,
});

export const contactInfoSchema = clientSchema.pick({
  mobileNumber: true,
  email: true,
  districtId: true,
  upazilaId: true,
  address: true,
  latitude: true,
  longitude: true,
});

export const networkInfoSchema = clientSchema.pick({
  mikrotikServerId: true,
  protocolTypeId: true,
  zoneId: true,
  subzoneId: true,
  connectionTypeId: true,
  cableRequirement: true,
  fiberCode: true,
  numberOfCore: true,
  coreColor: true,
});

export const serviceInfoSchema = clientSchema.pick({
  trackCode: true,
  serviceProfileId: true,
  clientType: true,
  billingStatus: true,
  mikrotikUsername: true,
  password: true,
  joiningDate: true,
  billingCycle: true,
  referenceBy: true,
  isVipClient: true,
  connectedBy: true,
  assignTo: true,
});
