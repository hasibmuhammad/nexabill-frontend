import { z } from "zod";

export const upazilaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type UpazilaFormValues = z.infer<typeof upazilaSchema>;
