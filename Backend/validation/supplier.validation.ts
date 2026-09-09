import { z } from "zod";

/* =========================================================
   CREATE SUPPLIER
========================================================= */

export const createSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name cannot exceed 100 characters"),

  companyName: z
    .string()
    .trim()
    .max(150, "Company name cannot exceed 150 characters")
    .optional(),

  mobile: z
    .string()
    .trim()
    .min(7, "Mobile number must be at least 7 characters")
    .max(20, "Mobile number cannot exceed 20 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(300, "Address cannot exceed 300 characters")
    .optional(),

  taxNumber: z
    .string()
    .trim()
    .max(50, "Tax number cannot exceed 50 characters")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

/* =========================================================
   UPDATE SUPPLIER
========================================================= */

export const updateSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Supplier name must be at least 2 characters")
    .max(100, "Supplier name cannot exceed 100 characters")
    .optional(),

  companyName: z
    .string()
    .trim()
    .max(150, "Company name cannot exceed 150 characters")
    .optional(),

  mobile: z
    .string()
    .trim()
    .min(7, "Mobile number must be at least 7 characters")
    .max(20, "Mobile number cannot exceed 20 characters")
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(300, "Address cannot exceed 300 characters")
    .optional(),

  taxNumber: z
    .string()
    .trim()
    .max(50, "Tax number cannot exceed 50 characters")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),

  isActive: z.boolean().optional(),
});

/* =========================================================
   TYPES
========================================================= */

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
