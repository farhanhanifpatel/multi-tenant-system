export type NotificationType =
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "PAYMENT_DUE"
  | "SUPPLIER_DUE"
  | "SUBSCRIPTION"
  | "SALE"
  | "SYSTEM";

export type NotificationReferenceType =
  | "PRODUCT"
  | "CUSTOMER"
  | "SUPPLIER"
  | "SUBSCRIPTION"
  | "SALE"
  | "SYSTEM";

export interface Notification {
  _id: string;
  shopId: string;
  userId: string;

  title: string;
  message: string;
  type: NotificationType;

  referenceId?: string;
  referenceType?: NotificationReferenceType;

  isRead: boolean;
  isCleared: boolean;

  createdAt: string;
  updatedAt: string;
}
