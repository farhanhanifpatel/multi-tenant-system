import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name must be at least 2 characters"),

  companyName: z.string().optional().or(z.literal("")),

  mobile: z.string().min(1, "Mobile number is required"),

  email: z.string().email("Please enter a valid email"),

  address: z.string().optional().or(z.literal("")),

  taxNumber: z.string().optional().or(z.literal("")),

  notes: z.string().optional().or(z.literal("")),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
