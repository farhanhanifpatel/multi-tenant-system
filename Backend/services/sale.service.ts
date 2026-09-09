import mongoose from "mongoose";

import Product from "../models/product.model";
import { Customer } from "../models/customer.model";
import { Sale } from "../models/sale.model";

import { AppError } from "../shared/AppError";

import { CreateSaleRequest } from "../validation/sale.validation";
import { SaleResponse } from "../types/sale.type";

import { PaymentStatus } from "../constants/payments";
import { APIFeatures } from "../utils/apiFeatures";
import { TransactionType } from "../constants/transaction-type";
import { Transaction } from "../models/transaction.model";

export const createSaleService = async (
  shopId: string,
  userId: string,
  payload: CreateSaleRequest,
): Promise<SaleResponse> => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const productIds = payload.items.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
      shopId,
      isActive: true,
    }).session(session);

    if (products.length !== productIds.length) {
      throw new AppError("One or more products not found", 404);
    }

    let totalAmount = 0;

    const saleItems = [];

    for (const item of payload.items) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`${product.name} has insufficient stock`, 400);
      }

      const subtotal = product.sellingPrice * item.quantity;

      totalAmount += subtotal;

      saleItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.sellingPrice,
        subtotal,
      });

      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        },
        {
          session,
        },
      );
    }

    const paidAmount = payload.paidAmount || 0;

    if (paidAmount > totalAmount) {
      throw new AppError("Paid amount cannot exceed total amount", 400);
    }

    const dueAmount = totalAmount - paidAmount;

    let paymentStatus: PaymentStatus;

    if (dueAmount === 0) {
      paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount === 0) {
      paymentStatus = PaymentStatus.UNPAID;
    } else {
      paymentStatus = PaymentStatus.PARTIAL;
    }

    if (dueAmount > 0 && !payload.customerId) {
      throw new AppError(
        "Customer is required for unpaid or partial sales",
        400,
      );
    }

    if (payload.customerId) {
      const customer = await Customer.findOne({
        _id: payload.customerId,
        shopId,
        isActive: true,
      }).session(session);

      if (!customer) {
        throw new AppError("Customer not found", 404);
      }
    }

    const sale = (
      await Sale.create(
        [
          {
            shopId,

            customerId: payload.customerId || undefined,

            items: saleItems,

            totalAmount,
            paidAmount,
            dueAmount,

            paymentMethod: payload.paymentMethod as any,

            paymentStatus,
          },
        ],
        {
          session,
        },
      )
    )[0];

    if (payload.customerId && dueAmount > 0) {
      await Customer.findByIdAndUpdate(
        payload.customerId,
        {
          $inc: {
            dueAmount,
          },
        },
        {
          session,
        },
      );

      await Transaction.create(
        [
          {
            shopId,
            customerId: payload.customerId,
            type: TransactionType.CREDIT,
            amount: dueAmount,
            note: "Sale Due",
            createdBy: userId,
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();

    return {
      saleId: sale._id.toString(),

      totalAmount,

      paidAmount,

      dueAmount,

      paymentMethod: payload.paymentMethod,
      paymentStatus: sale.paymentStatus,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const getSalesTrendService = async (shopId: string) => {
  const trend = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date();

    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      shopId,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    trend.push({
      date: start.toISOString().split("T")[0],
      sales: totalSales,
    });
  }

  return trend;
};

export const getTopProductsService = async (shopId: string) => {
  const result = await Sale.aggregate([
    {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId),
      },
    },

    {
      $unwind: "$items",
    },

    {
      $group: {
        _id: "$items.productId",
        quantitySold: {
          $sum: "$items.quantity",
        },
      },
    },

    {
      $sort: {
        quantitySold: -1,
      },
    },

    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },

    {
      $unwind: "$product",
    },

    {
      $project: {
        _id: 0,
        productId: "$product._id",
        name: "$product.name",
        quantitySold: 1,
      },
    },
  ]);

  return result;
};

export const getSalesService = async (
  shopId: string,
  queryParams: Record<string, any>,
) => {
  const filter: Record<string, any> = {
    shopId,
  };

  // Search by customer name or mobile
  if (queryParams.search) {
    const customers = await Customer.find({
      shopId,
      isActive: true,
      $or: [
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
      ],
    }).select("_id");

    filter.customerId = {
      $in: customers.map((customer) => customer._id),
    };
  }

  // Filter by specific customer
  if (queryParams.customerId) {
    filter.customerId = queryParams.customerId;
  }

  // Filter by payment status
  if (queryParams.paymentStatus) {
    filter.paymentStatus = queryParams.paymentStatus;
  }

  // Filter by date
  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};

    if (queryParams.startDate) {
      filter.createdAt.$gte = new Date(queryParams.startDate);
    }

    if (queryParams.endDate) {
      filter.createdAt.$lte = new Date(queryParams.endDate);
    }
  }

  const total = await Sale.countDocuments(filter);

  const features = new APIFeatures(
    Sale.find(filter).populate("customerId", "name mobile"),
    queryParams,
  )
    .sort()
    .limitFields()
    .paginate();

  const sales = await features.query;

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  return {
    sales,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSaleByIdService = async (shopId: string, saleId: string) => {
  if (!mongoose.Types.ObjectId.isValid(saleId)) {
    throw new AppError("Invalid sale id", 400);
  }

  const sale = await Sale.findOne({
    _id: saleId,
    shopId,
  })
    .populate("customerId", "name mobile address dueAmount")
    .populate("items.productId", "name sku category sellingPrice unit");

  if (!sale) {
    throw new AppError("Sale not found", 404);
  }

  return sale;
};
