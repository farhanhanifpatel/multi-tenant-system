import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),

  mobile: z
    .string()
    .min(10, "Mobile must be 10 digits")
    .max(10, "Mobile must be 10 digits"),

  address: z.string().optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;
