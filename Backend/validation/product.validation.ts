import { z } from "zod";

export const createProductSchema = z

  .object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .max(100, "Product name cannot exceed 100 characters"),

    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(50, "SKU cannot exceed 50 characters"),

    category: z.string().trim().min(1, "Category is required"),

    purchasePrice: z.coerce
      .number()
      .nonnegative("Purchase price cannot be negative"),

    sellingPrice: z.coerce
      .number()
      .nonnegative("Selling price cannot be negative"),

    stock: z.coerce
      .number()
      .int("Stock must be a whole number")
      .nonnegative("Stock cannot be negative"),

    lowStockThreshold: z.coerce
      .number()
      .int("Low stock threshold must be a whole number")
      .nonnegative("Low stock threshold cannot be negative"),

    unit: z.string().trim().min(1, "Unit is required"),

    image: z.string().url("Invalid image URL").optional(),
  })
  .refine((data) => data.sellingPrice >= data.purchasePrice, {
    message: "Selling price must be greater than or equal to purchase price",
    path: ["sellingPrice"],
  });

export type CreateProductRequest = z.infer<typeof createProductSchema>;

export const updateProductSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .max(100)
      .optional(),

    sku: z.string().trim().min(1, "SKU is required").max(50).optional(),

    category: z.string().trim().min(1, "Category is required").optional(),

    purchasePrice: z.coerce
      .number()
      .nonnegative("Purchase price cannot be negative"),

    sellingPrice: z.coerce
      .number()
      .nonnegative("Selling price cannot be negative"),

    stock: z.coerce
      .number()
      .int("Stock must be a whole number")
      .nonnegative("Stock cannot be negative"),

    lowStockThreshold: z.coerce
      .number()
      .int("Low stock threshold must be a whole number")
      .nonnegative("Low stock threshold cannot be negative"),
    unit: z.string().trim().min(1, "Unit is required").optional(),

    image: z.string().url("Invalid image URL").optional(),
  })
  .refine(
    (data) => {
      if (data.purchasePrice !== undefined && data.sellingPrice !== undefined) {
        return data.sellingPrice >= data.purchasePrice;
      }

      return true;
    },
    {
      message: "Selling price must be greater than or equal to purchase price",
      path: ["sellingPrice"],
    },
  );

export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
