import { z } from "zod";

export const productSchema = z
  .object({
    name: z.string().min(3, "Product name must be at least 3 characters"),

    sku: z.string().min(3, "SKU must be at least 3 characters"),

    category: z.string().min(1, "Category is required"),

    purchasePrice: z.coerce
      .number()
      .positive("Purchase price must be greater than 0"),

    sellingPrice: z.coerce
      .number()
      .positive("Selling price must be greater than 0"),

    stock: z.coerce.number().min(0, "Stock cannot be negative"),

    lowStockThreshold: z.coerce
      .number()
      .min(0, "Low stock threshold cannot be negative"),

    unit: z.string().min(1, "Unit is required"),

    image: z.instanceof(File).optional(),
  })
  .refine((data) => data.sellingPrice >= data.purchasePrice, {
    message: "Selling price must be greater than or equal to purchase price",
    path: ["sellingPrice"],
  });

export type ProductFormInput = z.input<typeof productSchema>;

export type ProductFormData = z.output<typeof productSchema>;
