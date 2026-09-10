import mongoose, { Document, Schema } from "mongoose";

export enum NotificationType {
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  PAYMENT_DUE = "PAYMENT_DUE",
  SUPPLIER_DUE = "SUPPLIER_DUE",
  SUBSCRIPTION = "SUBSCRIPTION",
  SALE = "SALE",
  SYSTEM = "SYSTEM",
}

export enum NotificationReferenceType {
  PRODUCT = "PRODUCT",
  CUSTOMER = "CUSTOMER",
  SUPPLIER = "SUPPLIER",
  SUBSCRIPTION = "SUBSCRIPTION",
  SALE = "SALE",
  SYSTEM = "SYSTEM",
}

export interface INotification extends Document {
  shopId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;

  title: string;
  message: string;
  type: NotificationType;

  referenceId?: mongoose.Types.ObjectId;
  referenceType?: NotificationReferenceType;

  isRead: boolean;
  isCleared: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
      required: false,
    },

    referenceType: {
      type: String,
      enum: Object.values(NotificationReferenceType),
      required: false,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    isCleared: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({
  shopId: 1,
  userId: 1,
  type: 1,
  referenceId: 1,
  isCleared: 1,
});

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

export default Notification;
