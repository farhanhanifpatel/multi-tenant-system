import { Router } from "express";

import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplier.controller";

import { authMiddleware } from "../middleware/auth.middleware";

import { validateRequest } from "../validation/validation.request";
import { createSupplierSchema } from "../validation/supplier.validation";
const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createSupplierSchema),
  createSupplier,
);

router.get("/", authMiddleware, getSuppliers);

router.get("/:id", authMiddleware, getSupplierById);

router.patch("/:id", authMiddleware, updateSupplier);

router.delete("/:id", authMiddleware, deleteSupplier);

export default router;
