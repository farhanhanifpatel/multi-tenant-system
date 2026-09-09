import { Types } from "mongoose";
import { PaymentMethod, PaymentStatus } from "../constants/payments";

export interface ISaleItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ISale {
  shopId: Types.ObjectId;

  customerId?: Types.ObjectId;

  items: ISaleItem[];

  totalAmount: number;

  paidAmount: number;

  dueAmount: number;

  paymentMethod: PaymentMethod;

  paymentStatus: PaymentStatus;

  createdAt?: Date;
  updatedAt?: Date;
}
