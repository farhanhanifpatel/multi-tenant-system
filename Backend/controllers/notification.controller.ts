import { NextFunction, Request } from "express";

import {
  getNotificationsService,
  getUnreadNotificationCountService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  clearNotificationService,
  clearAllNotificationsService,
} from "../services/notification.service";

import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../shared/responses";
import { AuthRequest } from "../interface/auth-request.interface";

// GET /notifications
export const getNotifications = catchAsync(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    const notifications = await getNotificationsService(
      req.user!.shopId,
      req.user!.userId,
    );

    return sendSuccess(res, {
      message: "Notifications fetched successfully",
      data: notifications,
      statusCode: 200,
    });
  },
);

// GET /notifications/unread-count
export const getUnreadNotificationCount = catchAsync(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    const count = await getUnreadNotificationCountService(
      req.user!.shopId,
      req.user!.userId,
    );

    return sendSuccess(res, {
      message: "Unread notification count fetched successfully",
      data: { count },
      statusCode: 200,
    });
  },
);

// PATCH /notifications/:id/read
export const markNotificationAsRead = catchAsync(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    const notification = await markNotificationAsReadService(
      String(req.params!.id),
      req.user!.shopId,
      req.user!.userId,
    );

    return sendSuccess(res, {
      message: "Notification marked as read",
      data: notification,
      statusCode: 200,
    });
  },
);

// PATCH /notifications/read-all
export const markAllNotificationsAsRead = catchAsync(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    await markAllNotificationsAsReadService(req.user!.shopId, req.user!.userId);

    return sendSuccess(res, {
      message: "All notifications marked as read",
      data: null,
      statusCode: 200,
    });
  },
);

// PATCH /notifications/:id/clear
export const clearNotification = catchAsync(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    await clearNotificationService(
      String(req.params!.id),
      req.user!.shopId,
      req.user!.userId,
    );

    return sendSuccess(res, {
      message: "Notification cleared successfully",
      data: null,
      statusCode: 200,
    });
  },
);

// PATCH /notifications/clear-all
export const clearAllNotifications = catchAsync(
  async (req: AuthRequest, res: any, next: NextFunction) => {
    await clearAllNotificationsService(req.user!.shopId, req.user!.userId);

    return sendSuccess(res, {
      message: "All notifications cleared successfully",
      data: null,
      statusCode: 200,
    });
  },
);
