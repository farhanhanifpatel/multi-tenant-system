import mongoose from "mongoose";

import { Supplier } from "../models/supplier.model";
import Product from "../models/product.model";
import { SupplierPurchase } from "../models/supplierPurchase.model";
import { Transaction } from "../models/transaction.model";

import { TransactionType } from "../constants/transaction-type";

import type {
  CreateSupplierPaymentRequest,
  CreateSupplierPurchaseRequest,
  SupplierPaymentResponse,
  SupplierPurchaseQuery,
  SupplierPurchaseResponse,
} from "../types/supplierPurchase.types";

import { AppError } from "../shared/AppError";
import { APIFeatures } from "../utils/apiFeatures";

/* =========================================================
   CREATE SUPPLIER PURCHASE
========================================================= */

export const createSupplierPurchaseService = async (
  shopId: string,
  userId: string,
  payload: CreateSupplierPurchaseRequest,
): Promise<SupplierPurchaseResponse> => {
  const session = await mongoose.startSession();

  try {
    /* =====================================================
       1. VALIDATE SHOP ID
    ===================================================== */

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      throw new AppError("Invalid shop id", 400);
    }

    /* =====================================================
       2. VALIDATE USER ID
    ===================================================== */

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user id", 400);
    }

    /* =====================================================
       3. VALIDATE SUPPLIER ID
    ===================================================== */

    if (!payload.supplierId) {
      throw new AppError("Supplier is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(payload.supplierId)) {
      throw new AppError("Invalid supplier id", 400);
    }

    /* =====================================================
       4. VALIDATE ITEMS
    ===================================================== */

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      throw new AppError("Purchase must contain at least one product", 400);
    }

    /*
     * Protect the API from extremely large requests.
     *
     * You can change this depending on your business.
     */
    if (payload.items.length > 100) {
      throw new AppError(
        "A purchase cannot contain more than 100 products",
        400,
      );
    }

    /* =====================================================
       5. VALIDATE DUPLICATE PRODUCTS
    ===================================================== */

    const productIds = payload.items.map((item) => item.productId);

    const uniqueProductIds = new Set(productIds);

    if (uniqueProductIds.size !== productIds.length) {
      throw new AppError(
        "The same product cannot appear multiple times in one purchase",
        400,
      );
    }

    /* =====================================================
       6. START TRANSACTION
    ===================================================== */

    session.startTransaction();

    /* =====================================================
       7. FIND SUPPLIER
    ===================================================== */

    const supplier = await Supplier.findOne({
      _id: payload.supplierId,
      shopId,
      isActive: true,
    }).session(session);

    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }

    /* =====================================================
       8. VALIDATE PRODUCT IDS
    ===================================================== */

    for (const productId of productIds) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new AppError(`Invalid product id: ${productId}`, 400);
      }
    }

    /* =====================================================
       9. FETCH PRODUCTS
    ===================================================== */

    const products = await Product.find({
      _id: {
        $in: productIds,
      },
      shopId,
      isActive: true,
    }).session(session);

    /* =====================================================
       10. VERIFY ALL PRODUCTS EXIST
    ===================================================== */

    if (products.length !== uniqueProductIds.size) {
      const foundIds = new Set(
        products.map((product) => product._id.toString()),
      );

      const missingProduct = productIds.find((id) => !foundIds.has(id));

      throw new AppError(`Product not found: ${missingProduct}`, 404);
    }

    /* =====================================================
       11. CREATE PRODUCT MAP
    ===================================================== */

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    /* =====================================================
       12. CALCULATE PURCHASE
    ===================================================== */

    let totalAmount = 0;

    const purchaseItems = [];

    for (const item of payload.items) {
      /* ===================================================
         VALIDATE QUANTITY
      =================================================== */

      if (
        typeof item.quantity !== "number" ||
        !Number.isFinite(item.quantity)
      ) {
        throw new AppError("Product quantity must be a valid number", 400);
      }

      if (item.quantity <= 0) {
        throw new AppError("Product quantity must be greater than 0", 400);
      }

      /* ===================================================
         VALIDATE PURCHASE PRICE
      =================================================== */

      if (
        typeof item.purchasePrice !== "number" ||
        !Number.isFinite(item.purchasePrice)
      ) {
        throw new AppError("Purchase price must be a valid number", 400);
      }

      if (item.purchasePrice <= 0) {
        throw new AppError("Purchase price must be greater than 0", 400);
      }

      /* ===================================================
         GET PRODUCT
      =================================================== */

      const product = productMap.get(item.productId);

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      /* ===================================================
         CALCULATE SUBTOTAL
      =================================================== */

      const subtotal = item.quantity * item.purchasePrice;

      if (!Number.isFinite(subtotal)) {
        throw new AppError("Invalid purchase amount", 400);
      }

      totalAmount += subtotal;

      purchaseItems.push({
        productId: product._id,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal,
      });
    }

    /* =====================================================
       13. VALIDATE TOTAL
    ===================================================== */

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new AppError("Purchase total must be greater than 0", 400);
    }

    /*
     * Optional but recommended.
     *
     * Prevent accidental enormous financial values.
     */
    if (totalAmount > 1_000_000_000) {
      throw new AppError("Purchase amount is too large", 400);
    }

    /* =====================================================
       14. VALIDATE PAID AMOUNT
    ===================================================== */

    const paidAmount = payload.paidAmount ?? 0;

    if (typeof paidAmount !== "number" || !Number.isFinite(paidAmount)) {
      throw new AppError("Paid amount must be a valid number", 400);
    }

    if (paidAmount < 0) {
      throw new AppError("Paid amount cannot be negative", 400);
    }

    if (paidAmount > totalAmount) {
      throw new AppError(
        "Paid amount cannot exceed total purchase amount",
        400,
      );
    }

    /* =====================================================
       15. CALCULATE DUE
    ===================================================== */

    const dueAmount = totalAmount - paidAmount;

    /* =====================================================
       16. ROUND MONEY VALUES
    ===================================================== */

    const finalTotalAmount = Number(totalAmount.toFixed(2));

    const finalPaidAmount = Number(paidAmount.toFixed(2));

    const finalDueAmount = Number(dueAmount.toFixed(2));

    /* =====================================================
       17. UPDATE PRODUCT STOCK SAFELY
    ===================================================== */

    /*
     * We update each product inside the transaction.
     *
     * Because this is an INCREASE operation, concurrent
     * purchases are safe at MongoDB's atomic update level.
     */

    for (const item of payload.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          shopId,
          isActive: true,
        },
        {
          $inc: {
            stock: item.quantity,
          },
        },
        {
          session,
          new: true,
        },
      );

      if (!updatedProduct) {
        throw new AppError(
          `Product not found while updating stock: ${item.productId}`,
          404,
        );
      }
    }

    /* =====================================================
       18. CREATE PURCHASE
    ===================================================== */

    const purchaseResult = await SupplierPurchase.create(
      [
        {
          shopId,
          supplierId: payload.supplierId,

          items: purchaseItems,

          totalAmount: finalTotalAmount,
          paidAmount: finalPaidAmount,
          dueAmount: finalDueAmount,

          paymentMethod: payload.paymentMethod,

          note: payload.note,

          createdBy: userId,
        },
      ],
      {
        session,
      },
    );

    const purchase = purchaseResult[0];

    if (!purchase) {
      throw new AppError("Failed to create supplier purchase", 500);
    }

    /* =====================================================
       19. UPDATE SUPPLIER BALANCE
    ===================================================== */

    const updatedSupplier = await Supplier.findOneAndUpdate(
      {
        _id: payload.supplierId,
        shopId,
        isActive: true,
      },
      {
        $inc: {
          totalPurchaseAmount: finalTotalAmount,
          totalPaidAmount: finalPaidAmount,
          dueAmount: finalDueAmount,
        },
      },
      {
        session,
        new: true,
      },
    );

    if (!updatedSupplier) {
      throw new AppError("Supplier could not be updated", 500);
    }

    /* =====================================================
       20. CREATE SUPPLIER CREDIT TRANSACTION
    ===================================================== */

    await Transaction.create(
      [
        {
          shopId,

          supplierId: payload.supplierId,

          type: TransactionType.CREDIT,

          amount: finalTotalAmount,

          note: `Supplier purchase - ${purchase._id}`,

          createdBy: userId,
        },
      ],
      {
        session,
      },
    );

    /* =====================================================
       21. CREATE SUPPLIER PAYMENT TRANSACTION
    ===================================================== */

    if (finalPaidAmount > 0) {
      await Transaction.create(
        [
          {
            shopId,

            supplierId: payload.supplierId,

            type: TransactionType.PAYMENT,

            amount: finalPaidAmount,

            note: `Payment to supplier - ${purchase._id}`,

            createdBy: userId,
          },
        ],
        {
          session,
        },
      );
    }

    /* =====================================================
       22. COMMIT TRANSACTION
    ===================================================== */

    await session.commitTransaction();

    /* =====================================================
       23. RETURN RESPONSE
    ===================================================== */

    return {
      purchaseId: purchase._id.toString(),

      supplierId: payload.supplierId,

      totalAmount: finalTotalAmount,

      paidAmount: finalPaidAmount,

      dueAmount: finalDueAmount,

      paymentMethod: payload.paymentMethod,

      note: payload.note,
    };
  } catch (error) {
    /* =====================================================
       ROLLBACK EVERYTHING
    ===================================================== */

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    /* =====================================================
       CLOSE SESSION
    ===================================================== */

    await session.endSession();
  }
};

export const getSupplierPurchasesService = async (
  shopId: string,
  queryParams: SupplierPurchaseQuery,
) => {
  /* =======================================================
     1. VALIDATE SHOP ID
  ======================================================= */

  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    throw new AppError("Invalid shop id", 400);
  }

  /* =======================================================
     2. BASE FILTER
  ======================================================= */

  const filter: Record<string, any> = {
    shopId,
  };

  /* =======================================================
     3. FILTER BY SUPPLIER
  ======================================================= */

  if (queryParams.supplierId) {
    if (!mongoose.Types.ObjectId.isValid(queryParams.supplierId)) {
      throw new AppError("Invalid supplier id", 400);
    }

    const supplier = await Supplier.findOne({
      _id: queryParams.supplierId,
      shopId,
      isActive: true,
    }).select("_id");

    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }

    filter.supplierId = queryParams.supplierId;
  }

  /* =======================================================
     4. DATE FILTER
  ======================================================= */

  if (queryParams.startDate || queryParams.endDate) {
    filter.createdAt = {};

    if (queryParams.startDate) {
      const startDate = new Date(queryParams.startDate);

      if (Number.isNaN(startDate.getTime())) {
        throw new AppError("Invalid start date", 400);
      }

      startDate.setHours(0, 0, 0, 0);

      filter.createdAt.$gte = startDate;
    }

    if (queryParams.endDate) {
      const endDate = new Date(queryParams.endDate);

      if (Number.isNaN(endDate.getTime())) {
        throw new AppError("Invalid end date", 400);
      }

      endDate.setHours(23, 59, 59, 999);

      filter.createdAt.$lte = endDate;
    }
  }

  /* =======================================================
     5. SEARCH BY NOTE
  ======================================================= */

  if (queryParams.search) {
    filter.note = {
      $regex: queryParams.search.trim(),
      $options: "i",
    };
  }

  /* =======================================================
     6. TOTAL COUNT
  ======================================================= */

  const total = await SupplierPurchase.countDocuments(filter);

  /* =======================================================
     7. QUERY FEATURES
  ======================================================= */

  const features = new APIFeatures(
    SupplierPurchase.find(filter)
      .populate("supplierId", "name companyName mobile")
      .populate("createdBy", "name email"),
    queryParams,
  )
    .sort()
    .limitFields()
    .paginate();

  const purchases = await features.query;

  /* =======================================================
     8. PAGINATION
  ======================================================= */

  const page = Math.max(Number(queryParams.page) || 1, 1);

  const limit = Math.min(Math.max(Number(queryParams.limit) || 10, 1), 100);

  /* =======================================================
     9. RETURN
  ======================================================= */

  return {
    purchases,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSupplierPurchaseByIdService = async (
  shopId: string,
  purchaseId: string,
) => {
  // =========================================================
  // 1. VALIDATE PURCHASE ID
  // =========================================================

  if (!mongoose.Types.ObjectId.isValid(purchaseId)) {
    throw new AppError("Invalid purchase id", 400);
  }

  // =========================================================
  // 2. FIND PURCHASE
  // =========================================================

  const purchase = await SupplierPurchase.findOne({
    _id: purchaseId,
    shopId,
  })
    .populate("supplierId", "name companyName mobile email address")
    .populate("items.productId", "name sku category sellingPrice unit")
    .populate("createdBy", "name email");

  // =========================================================
  // 3. CHECK PURCHASE
  // =========================================================

  if (!purchase) {
    throw new AppError("Supplier purchase not found", 404);
  }

  return purchase;
};

export const createSupplierPaymentService = async (
  shopId: string,
  userId: string,
  payload: CreateSupplierPaymentRequest,
): Promise<SupplierPaymentResponse> => {
  const session = await mongoose.startSession();

  try {
    // =========================================================
    // 1. VALIDATE SUPPLIER ID
    // =========================================================

    if (!payload.supplierId) {
      throw new AppError("Supplier is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(payload.supplierId)) {
      throw new AppError("Invalid supplier id", 400);
    }

    // =========================================================
    // 2. VALIDATE PAYMENT AMOUNT
    // =========================================================

    if (
      typeof payload.amount !== "number" ||
      !Number.isFinite(payload.amount)
    ) {
      throw new AppError("Payment amount must be a valid number", 400);
    }

    if (payload.amount <= 0) {
      throw new AppError("Payment amount must be greater than 0", 400);
    }

    // =========================================================
    // 3. START TRANSACTION
    // =========================================================

    session.startTransaction();

    // =========================================================
    // 4. FIND SUPPLIER
    // =========================================================

    const supplier = await Supplier.findOne({
      _id: payload.supplierId,
      shopId,
      isActive: true,
    }).session(session);

    if (!supplier) {
      throw new AppError("Supplier not found", 404);
    }

    // =========================================================
    // 5. CHECK SUPPLIER DUE
    // =========================================================

    // `dueAmount` is present in the persisted supplier document, but is not
    // currently declared on the ISupplier TypeScript interface.
    const currentDue = Number(supplier.get("dueAmount") || 0);

    if (currentDue <= 0) {
      throw new AppError("Supplier has no outstanding balance", 400);
    }

    if (payload.amount > currentDue) {
      throw new AppError(
        `Payment cannot exceed supplier due amount of ${currentDue}`,
        400,
      );
    }

    // =========================================================
    // 6. CALCULATE REMAINING DUE
    // =========================================================

    const amount = Number(payload.amount.toFixed(2));

    const remainingDue = Number((currentDue - amount).toFixed(2));

    // =========================================================
    // 7. UPDATE SUPPLIER BALANCE
    // =========================================================

    const updatedSupplier = await Supplier.findOneAndUpdate(
      {
        _id: payload.supplierId,
        shopId,
        isActive: true,

        // Important for concurrent payment requests
        dueAmount: { $gte: amount },
      },
      {
        $inc: {
          totalPaidAmount: amount,
          dueAmount: -amount,
        },
      },
      {
        session,
        new: true,
      },
    );

    if (!updatedSupplier) {
      throw new AppError(
        "Supplier balance changed or payment exceeds outstanding balance",
        400,
      );
    }

    if (!updatedSupplier) {
      throw new AppError("Supplier could not be updated", 500);
    }

    // =========================================================
    // 8. CREATE PAYMENT TRANSACTION
    // =========================================================

    const transactionResult = await Transaction.create(
      [
        {
          shopId,
          supplierId: payload.supplierId,
          type: TransactionType.PAYMENT,
          amount,
          note: payload.note || "Payment to supplier",
          createdBy: userId,
        },
      ],
      {
        session,
      },
    );

    const transaction = transactionResult[0];

    if (!transaction) {
      throw new AppError("Failed to create supplier payment", 500);
    }

    // =========================================================
    // 9. COMMIT TRANSACTION
    // =========================================================

    await session.commitTransaction();

    // =========================================================
    // 10. RESPONSE
    // =========================================================

    return {
      paymentId: transaction._id.toString(),
      supplierId: payload.supplierId,
      amount,
      remainingDue,
      paymentMethod: payload.paymentMethod,
      note: payload.note,
    };
  } catch (error) {
    // =========================================================
    // ROLLBACK
    // =========================================================

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

export const getSupplierTransactionsService = async (
  shopId: string,
  supplierId: string,
) => {
  // =========================================================
  // 1. VALIDATE SUPPLIER ID
  // =========================================================

  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    throw new AppError("Invalid supplier id", 400);
  }

  // =========================================================
  // 2. VERIFY SUPPLIER BELONGS TO SHOP
  // =========================================================

  const supplier = await Supplier.findOne({
    _id: supplierId,
    shopId,
    isActive: true,
  }).select("_id name companyName mobile dueAmount");

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  // =========================================================
  // 3. GET TRANSACTIONS
  // =========================================================

  const transactions = await Transaction.find({
    shopId,
    supplierId,
  })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  // =========================================================
  // 4. CALCULATE LEDGER
  // =========================================================

  let totalCredit = 0;
  let totalPayment = 0;

  for (const transaction of transactions) {
    if (transaction.type === TransactionType.CREDIT) {
      totalCredit += transaction.amount;
    }

    if (transaction.type === TransactionType.PAYMENT) {
      totalPayment += transaction.amount;
    }
  }

  const outstandingBalance = Number((totalCredit - totalPayment).toFixed(2));

  // =========================================================
  // 5. RESPONSE
  // =========================================================

  return {
    supplier: {
      id: supplier._id,
      name: supplier.name,
      companyName: supplier.companyName,
      mobile: supplier.mobile,
    },

    summary: {
      totalCredit: Number(totalCredit.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      outstandingBalance,
    },

    transactions,
  };
};

export const getSupplierSummaryService = async (
  shopId: string,
  supplierId: string,
) => {
  // =========================================================
  // 1. VALIDATE SUPPLIER ID
  // =========================================================

  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    throw new AppError("Invalid supplier id", 400);
  }

  // =========================================================
  // 2. FIND SUPPLIER
  // =========================================================

  const supplier = await Supplier.findOne({
    _id: supplierId,
    shopId,
    isActive: true,
  }).select(
    "_id name companyName mobile email totalPurchaseAmount totalPaidAmount dueAmount",
  );

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  // =========================================================
  // 3. RETURN SUMMARY
  // =========================================================

  return {
    supplier: {
      id: supplier._id,
      name: supplier.name,
      companyName: supplier.companyName,
      mobile: supplier.mobile,
      email: supplier.email,
    },

    financialSummary: {
      totalPurchaseAmount: supplier.totalPurchaseAmount,
      totalPaidAmount: supplier.totalPaidAmount,
      dueAmount: supplier.dueAmount,
    },
  };
};

export const getSupplierPurchaseSummaryService = async (shopId: string) => {
  const result = await SupplierPurchase.aggregate([
    {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId),
      },
    },
    {
      $group: {
        _id: null,

        totalPurchaseAmount: {
          $sum: "$totalAmount",
        },

        totalPaidAmount: {
          $sum: "$paidAmount",
        },

        totalDueAmount: {
          $sum: "$dueAmount",
        },

        totalPurchases: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalPurchases: 1,
        totalPurchaseAmount: 1,
        totalPaidAmount: 1,
        totalDueAmount: 1,
      },
    },
  ]);

  // No purchases yet
  if (result.length === 0) {
    return {
      totalPurchases: 0,
      totalPurchaseAmount: 0,
      totalPaidAmount: 0,
      totalDueAmount: 0,
    };
  }

  const summary = result[0];

  return {
    totalPurchases: summary.totalPurchases,
    totalPurchaseAmount: Number(summary.totalPurchaseAmount.toFixed(2)),
    totalPaidAmount: Number(summary.totalPaidAmount.toFixed(2)),
    totalDueAmount: Number(summary.totalDueAmount.toFixed(2)),
  };
};
