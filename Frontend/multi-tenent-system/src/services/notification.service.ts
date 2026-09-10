import { api } from "../api/axios";
import type { Notification } from "../types/notification.types";

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications");

  return response.data.data;
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  const response = await api.get("/notifications/unread-count");

  return response.data.data.count;
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<Notification> => {
  const response = await api.patch(`/notifications/${notificationId}/read`);

  return response.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};

export const clearNotification = async (
  notificationId: string,
): Promise<void> => {
  await api.patch(`/notifications/${notificationId}/clear`);
};

export const clearAllNotifications = async (): Promise<void> => {
  await api.patch("/notifications/clear-all");
};
