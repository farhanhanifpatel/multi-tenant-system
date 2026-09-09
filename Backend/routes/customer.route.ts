import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";

import { validateRequest } from "../validation/validation.request";

import { createCustomerSchema } from "../validation/customer.validator";

const router = Router();

router.post(
  "/",
  authMiddleware,
  validateRequest(createCustomerSchema),
  createCustomer,
);

router.get("/", authMiddleware, getCustomers);

router.get("/:id", authMiddleware, getCustomerById);

router.patch("/:id", authMiddleware, updateCustomer);

router.delete("/:id", authMiddleware, deleteCustomer);

export default router;
