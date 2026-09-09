import { z } from "zod";
import { PaymentMethod } from "../constants/payments";

export const supplierPurchaseItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),

  quantity: z.coerce.number().positive("Quantity must be greater than 0"),

  purchasePrice: z.coerce
    .number()
    .positive("Purchase price must be greater than 0"),
});

export const createSupplierPurchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),

  items: z
    .array(supplierPurchaseItemSchema)
    .min(1, "Purchase must contain at least one product")
    .max(100, "A purchase cannot contain more than 100 products"),

  paidAmount: z.coerce
    .number()
    .min(0, "Paid amount cannot be negative")
    .optional()
    .default(0),

  paymentMethod: z.nativeEnum(PaymentMethod).optional(),

  note: z
    .string()
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional(),
});

export type CreateSupplierPurchaseRequest = z.infer<
  typeof createSupplierPurchaseSchema
>;
