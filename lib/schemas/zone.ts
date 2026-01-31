import { z } from "zod";

export const zoneSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  code: z.string().max(32, "Code must be 32 characters or less").optional(),
  description: z.string().optional(),
});

export type ZoneFormValues = z.infer<typeof zoneSchema>;
