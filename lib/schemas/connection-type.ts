import { z } from "zod";

export const connectionTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ConnectionTypeFormValues = z.infer<typeof connectionTypeSchema>;
