import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  designation: z.enum(["ENGINEER", "TECHNICIAN", "BILL_COLLECTOR"], {
    errorMap: () => ({ message: "Designation is required" }),
  }),
  salary: z.string()
    .min(1, "Salary is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Salary must be a valid positive number"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
