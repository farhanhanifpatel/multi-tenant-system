import { z } from "zod";
import { BusinessType } from "../constants/business-type";

export const registerSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  ownerName: z.string().min(1, "Owner name is required"),

  email: z.email("Invalid email"),

  mobile: z.string().min(10, "Mobile must be at least 10 digits"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  businessType: z.enum(Object.values(BusinessType) as [string, ...string[]]),

  address: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;
