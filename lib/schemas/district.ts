import { z } from "zod";

export const districtSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type DistrictFormValues = z.infer<typeof districtSchema>;
