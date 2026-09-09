import mongoose, { Schema, Document } from "mongoose";

export type PaymentProvider = "AIRTEL_MONEY";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface IPaymentTransaction extends Document {
  shopId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;

  amount: number;
  phone: string;

  provider: PaymentProvider;
  status: PaymentStatus;

  reference: string;
  providerTransactionId?: string;

  note?: string;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
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
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    phone: {
      type: String,
      required: true,
    },

    provider: {
      type: String,
      enum: ["AIRTEL_MONEY"],
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    providerTransactionId: {
      type: String,
    },

    note: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const PaymentTransaction = mongoose.model<IPaymentTransaction>(
  "PaymentTransaction",
  paymentTransactionSchema,
);
