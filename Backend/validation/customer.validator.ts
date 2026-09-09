import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),

  mobile: z.string().trim().min(10, "Mobile number must be at least 10 digits"),

  address: z.string().trim().optional(),
});
