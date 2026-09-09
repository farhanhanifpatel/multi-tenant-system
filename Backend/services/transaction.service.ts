import mongoose from "mongoose";

import { Customer } from "../models/customer.model";
import { Transaction } from "../models/transaction.model";

import { AppError } from "../shared/AppError";

import {
  CreateCreditRequest,
  TransactionResponse,
} from "../types/transaction.types";

import { TransactionType } from "../constants/transaction-type";
import { APIFeatures } from "../utils/apiFeatures";

export const createCreditService = async (
  shopId: string,
  userId: string,
  payload: CreateCreditRequest,
): Promise<TransactionResponse> => {
  const customer = await Customer.findOne({
    _id: payload.customerId,
    shopId,
    isActive: true,
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const transaction = await Transaction.create({
    shopId: new mongoose.Types.ObjectId(shopId),

    customerId: customer._id,

    createdBy: new mongoose.Types.ObjectId(userId),

    amount: payload.amount,

    note: payload.note,

    type: TransactionType.CREDIT,
  });

  return {
    transactionId: transaction._id.toString(),
    customerId: customer._id.toString(),
    amount: transaction.amount,
    type: transaction.type,
    note: transaction.note,
  };
};

export const getCustomerLedgerService = async (
  shopId: string,
  customerId: string,
) => {
  const customer = await Customer.findOne({
    _id: customerId,
    shopId,
    isActive: true,
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  // Oldest first so balance is calculated correctly
  const transactions = await Transaction.find({
    shopId,
    customerId,
  }).sort({ createdAt: 1 });

  let balance = 0;

  const ledger = transactions.map((tx) => {
    if (tx.type === "CREDIT") {
      balance += tx.amount;
    }

    if (tx.type === "PAYMENT") {
      balance -= tx.amount;
    }

    return {
      _id: tx._id,
      date: tx.createdAt,
      type: tx.type,
      amount: tx.amount,
      note: tx.note,
      balance,
    };
  });

  // Newest first for UI
  ledger.reverse();

  return {
    customer: {
      _id: customer._id,
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address,
      dueAmount: customer.dueAmount,
    },
    ledger,
  };
};

export const getCustomerBalanceService = async (
  shopId: string,
  customerId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new AppError("Invalid customer id", 400);
  }

  const customer = await Customer.findOne({
    _id: customerId,
    shopId,
    isActive: true,
  });

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return {
    customerId: customer._id.toString(),
    customerName: customer.name,
    dueAmount: customer.dueAmount,
  };
};

export const getOutstandingService = async (
  shopId: string,
  queryParams: Record<string, any>,
) => {
  const filter: Record<string, any> = {
    shopId,
    isActive: true,
    dueAmount: { $gt: 0 },
  };

  // Search by name or mobile
  if (queryParams.search) {
    filter.$or = [
      {
        name: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        mobile: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
    ];
  }

  const total = await Customer.countDocuments(filter);

  const features = new APIFeatures(
    Customer.find(filter).select("name mobile dueAmount"),
    queryParams,
  )
    .sort()
    .paginate();

  const customers = await features.query;

  // Total outstanding of ALL matching customers
  const outstanding = await Customer.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,
        totalOutstanding: {
          $sum: "$dueAmount",
        },
      },
    },
  ]);

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  return {
    totalOutstanding: customers.reduce(
      (sum, customer) => sum + Number(customer.dueAmount || 0),
      0,
    ),
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const deleteTransactionService = async (
  shopId: string,
  transactionId: string,
) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    shopId,
  });

  if (!transaction) {
    throw new AppError("Transaction not found", 404);
  }

  return null;
};

export const createPaymentService = async (
  shopId: string,
  userId: string,
  payload: CreateCreditRequest,
): Promise<TransactionResponse> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const customer = await Customer.findOne({
      _id: payload.customerId,
      shopId,
      isActive: true,
    }).session(session);

    if (!customer) {
      throw new AppError("Customer not found", 404);
    }

    const dueAmount = customer.dueAmount ?? 0;

    if (payload.amount <= 0) {
      throw new AppError("Payment amount must be greater than zero", 400);
    }

    if (dueAmount <= 0) {
      throw new AppError("Customer has no outstanding due", 400);
    }

    if (payload.amount > dueAmount) {
      throw new AppError(
        `Payment cannot exceed due amount of ₹${dueAmount}`,
        400,
      );
    }

    const [transaction] = await Transaction.create(
      [
        {
          shopId: new mongoose.Types.ObjectId(shopId),

          customerId: customer._id,

          createdBy: new mongoose.Types.ObjectId(userId),

          amount: payload.amount,

          note: payload.note,

          type: TransactionType.PAYMENT,
        },
      ],
      {
        session,
      },
    );

    await Customer.findByIdAndUpdate(
      customer._id,
      {
        $inc: {
          dueAmount: -payload.amount,
        },
      },
      {
        session,
      },
    );

    await session.commitTransaction();

    return {
      transactionId: transaction._id.toString(),
      customerId: customer._id.toString(),
      amount: transaction.amount,
      type: transaction.type,
      note: transaction.note,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
