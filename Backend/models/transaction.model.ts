import mongoose, { Schema } from "mongoose";

import { ITransaction } from "../interface/transaction.interface";
import { TransactionType } from "../constants/transaction-type";

const transactionSchema = new Schema<ITransaction>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    /* =====================================================
       CUSTOMER
    ===================================================== */

    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },

    /* =====================================================
       SUPPLIER
    ===================================================== */

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      index: true,
    },

    /* =====================================================
       TRANSACTION TYPE
    ===================================================== */

    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },

    /* =====================================================
       AMOUNT
    ===================================================== */

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    /* =====================================================
       NOTE
    ===================================================== */

    note: {
      type: String,
      trim: true,
    },

    /* =====================================================
       CREATED BY
    ===================================================== */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema,
);
