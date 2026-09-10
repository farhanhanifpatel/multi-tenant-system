import mongoose from "mongoose";
import Notification, {
  NotificationReferenceType,
} from "../models/notification.model";
import {
  NotificationType,
  type INotification,
} from "../models/notification.model";
import { AppError } from "../shared/AppError";

interface CreateNotificationPayload {
  shopId: string;
  userId: string;

  title: string;
  message: string;
  type: NotificationType;

  referenceId?: string;
  referenceType?: NotificationReferenceType;
}

export const createNotificationService = async (
  payload: CreateNotificationPayload,
): Promise<INotification | null> => {
  const { shopId, userId, title, message, type, referenceId, referenceType } =
    payload;

  /*
   * Prevent duplicate active notifications
   *
   * Example:
   *
   * Rice stock = 10
   * → LOW_STOCK notification created
   *
   * Rice stock = 9
   * → No duplicate notification
   *
   * Rice stock = 8
   * → No duplicate notification
   */

  if (referenceId) {
    const existingNotification = await Notification.findOne({
      shopId,
      userId,
      type,
      referenceId,
      isCleared: false,
    });

    if (existingNotification) {
      return existingNotification;
    }
  }

  const notification = await Notification.create({
    shopId,
    userId,
    title,
    message,
    type,
    referenceId,
    referenceType,
    isRead: false,
    isCleared: false,
  });

  return notification;
};

export const getNotificationsService = async (
  shopId: string,
  userId: string,
): Promise<INotification[]> => {
  const notifications = await Notification.find({
    shopId,
    userId,
    isCleared: false,
  }).sort({ createdAt: -1 });

  return notifications;
};

export const getUnreadNotificationCountService = async (
  shopId: string,
  userId: string,
): Promise<number> => {
  const count = await Notification.countDocuments({
    shopId,
    userId,
    isRead: false,
    isCleared: false,
  });

  return count;
};

export const markNotificationAsReadService = async (
  notificationId: string,
  shopId: string,
  userId: string,
): Promise<INotification> => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError("Invalid notification ID", 400);
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      shopId,
      userId,
      isCleared: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    },
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return notification;
};

export const markAllNotificationsAsReadService = async (
  shopId: string,
  userId: string,
): Promise<void> => {
  await Notification.updateMany(
    {
      shopId,
      userId,
      isRead: false,
      isCleared: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );
};

export const clearNotificationService = async (
  notificationId: string,
  shopId: string,
  userId: string,
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError("Invalid notification ID", 400);
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      shopId,
      userId,
      isCleared: false,
    },
    {
      $set: {
        isCleared: true,
      },
    },
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }
};

export const clearAllNotificationsService = async (
  shopId: string,
  userId: string,
): Promise<void> => {
  await Notification.updateMany(
    {
      shopId,
      userId,
      isCleared: false,
    },
    {
      $set: {
        isCleared: true,
      },
    },
  );
};
