import { z } from "zod";

export const subzoneSchema = z.object({
  name: z.string().min(1, "Subzone name is required"),
  description: z.string().optional(),
  zoneId: z.string().min(1, "Zone is required"),
});

export type SubzoneFormValues = z.infer<typeof subzoneSchema>;
