import { z } from "zod";

export const createSaleSchema = z.object({
  customerId: z.string().optional(),

  paymentMethod: z.enum(["CASH", "UPI", "CARD"]),

  paidAmount: z.number().nonnegative(),

  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
      }),
    )
    .min(1),
});

export type CreateSaleRequest = z.infer<typeof createSaleSchema>;
