import { Types } from "mongoose";

import { TransactionType } from "../constants/transaction-type";

export interface ITransaction {
  shopId: Types.ObjectId;

  customerId?: Types.ObjectId;

  supplierId?: Types.ObjectId;

  type: TransactionType;

  amount: number;

  note?: string;

  createdBy: Types.ObjectId;

  createdAt?: Date;

  updatedAt?: Date;
}
