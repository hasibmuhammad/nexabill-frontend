import { z } from "zod";

export const protocolTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ProtocolTypeFormValues = z.infer<typeof protocolTypeSchema>;
