import { z } from "zod";

export const createCreditSchema = z.object({
  customerId: z.string().min(1),

  amount: z.number().positive(),

  note: z.string().trim().optional(),
});
