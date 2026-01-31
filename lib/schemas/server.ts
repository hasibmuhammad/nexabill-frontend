import { z } from "zod";

export const serverSchema = z.object({
  name: z.string().min(1, "Server name is required"),
  host: z.string()
    .min(1, "Host/IP address is required")
    .regex(/^([a-zA-Z0-9.-]+|((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d))$/, "Invalid hostname or IP address"),
  port: z.coerce.number().int().min(1, "Port must be between 1 and 65535").max(65535, "Port must be between 1 and 65535"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required").optional(), // Optional for updates
  description: z.string().optional(),
  location: z.string().optional(),
  importUsers: z.boolean().optional(),
});

export type ServerFormValues = z.infer<typeof serverSchema>;
