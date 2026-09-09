import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";

import { validateRequest } from "../validation/validation.request";

import { createCreditSchema } from "../validation/transaction.validation";

import {
  createPayment,
  getCustomerBalance,
  getCustomerLedger,
  getOutstanding,
} from "../controllers/transaction.controller";

const router = Router();

// router.post(
//   "/credit",
//   authMiddleware,
//   validateRequest(createCreditSchema),
//   createCredit,
// );

router.get("/customer/:customerId", authMiddleware, getCustomerLedger);

router.get("/customer/:customerId/balance", authMiddleware, getCustomerBalance);

router.get("/outstanding", authMiddleware, getOutstanding);

// router.delete("/:id", authMiddleware, deleteTransaction);

router.post(
  "/payment",
  authMiddleware,
  validateRequest(createCreditSchema),
  createPayment,
);
export default router;
