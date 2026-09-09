import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  exportProducts,
  getLowStockProducts,
  getProductById,
  getProducts,
  getProductStats,
  updateProduct,
} from "../controllers/product.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { getLowStockProductsService } from "../services/product.service";
import {
  createProductSchema,
  updateProductSchema,
} from "../validation/product.validation";
import { validateRequest } from "../validation/validation.request";
import { upload } from "../middleware/upload.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validateRequest(createProductSchema),
  createProduct,
);
router.get("/", authMiddleware, getProducts);

router.get("/export", authMiddleware, exportProducts);

router.get("/low-stock", authMiddleware, getLowStockProducts);

router.get("/stats", authMiddleware, getProductStats);

router.get("/:id", authMiddleware, getProductById);

router.patch(
  "/:id",
  authMiddleware,
  upload.single("image"),
  validateRequest(updateProductSchema),
  updateProduct,
);

router.delete("/:id", authMiddleware, deleteProduct);

export default router;
