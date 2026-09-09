import { Router } from "express";

import {
  createSupplierPayment,
  createSupplierPurchase,
  getSupplierPurchaseById,
  getSupplierPurchases,
  getSupplierPurchaseSummary,
  getSupplierSummary,
  getSupplierTransactions,
} from "../controllers/supplier-purchase.controller";

import { authMiddleware } from "../middleware/auth.middleware";

import { validateRequest } from "../validation/validation.request";

import { createSupplierPurchaseSchema } from "../validation/supplier-purchase.validator";

const router = Router();

// =========================================================
// CREATE SUPPLIER PURCHASE
// =========================================================

router.post(
  "/",
  authMiddleware,
  validateRequest(createSupplierPurchaseSchema),
  createSupplierPurchase,
);

// =========================================================
// GET ALL SUPPLIER PURCHASES
// =========================================================

router.get("/", authMiddleware, getSupplierPurchases);

// =========================================================
// SUPPLIER PURCHASE SUMMARY
// =========================================================

router.get("/summary", authMiddleware, getSupplierPurchaseSummary);

// =========================================================
// SUPPLIER PAYMENT
// =========================================================

router.post("/supplier-payments", authMiddleware, createSupplierPayment);

// =========================================================
// SUPPLIER TRANSACTIONS
// =========================================================

router.get(
  "/:supplierId/transactions",
  authMiddleware,
  getSupplierTransactions,
);

// =========================================================
// SUPPLIER SUMMARY
// =========================================================

router.get("/:supplierId/summary", authMiddleware, getSupplierSummary);

// =========================================================
// GET PURCHASE BY ID
// =========================================================

router.get("/:id", authMiddleware, getSupplierPurchaseById);

export default router;
