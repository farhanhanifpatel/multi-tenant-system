import { Router } from "express";

import {
  createSale,
  getSaleById,
  getSales,
  getSalesTrend,
  getTopProducts,
} from "../controllers/sale.controller";

import { authMiddleware } from "../middleware/auth.middleware";

import { validateRequest } from "../validation/validation.request";

import { createSaleSchema } from "../validation/sale.validation";

const router = Router();

router.post("/", authMiddleware, validateRequest(createSaleSchema), createSale);

router.get("/sales-trend", authMiddleware, getSalesTrend);

router.get("/top-products", authMiddleware, getTopProducts);

router.get("/get-sales", authMiddleware, getSales);

router.get("/:id", authMiddleware, getSaleById);

export default router;
