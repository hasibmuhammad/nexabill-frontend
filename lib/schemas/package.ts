import { z } from "zod";

export const packageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mikrotikProfile: z.string().min(1, "Mikrotik Profile is required"),
  monthlyPrice: z.string()
    .min(1, "Monthly Price is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Monthly Price must be a valid positive number"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type PackageFormValues = z.infer<typeof packageSchema>;
