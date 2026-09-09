import { getDashboardStats } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { Router } from "express";

const router = Router();
router.get("/stats", authMiddleware, getDashboardStats);

export default router;
