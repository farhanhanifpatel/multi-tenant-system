import { Router } from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotification,
  clearAllNotifications,
} from "../controllers/notification.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getNotifications);

router.get("/unread-count", authMiddleware, getUnreadNotificationCount);

router.patch("/:id/read", authMiddleware, markNotificationAsRead);

router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);

router.patch("/:id/clear", authMiddleware, clearNotification);

router.patch("/clear-all", authMiddleware, clearAllNotifications);

export default router;
