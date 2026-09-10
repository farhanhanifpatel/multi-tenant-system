import { Router } from "express";

import {
  getMe,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller";
import { loginSchema, registerSchema } from "../validation/auth.validation";
import { validateRequest } from "../validation/validation.request";
import { authMiddleware } from "../middleware/auth.middleware";
import { updateProfileSchema } from "../validation/profile.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

router.post("/login", validateRequest(loginSchema), login);

router.get("/me", authMiddleware, getMe);

router.post("/logout", authMiddleware, logout);

router.patch(
  "/profile",
  authMiddleware,
  validateRequest(updateProfileSchema),
  updateProfile,
);

export default router;
