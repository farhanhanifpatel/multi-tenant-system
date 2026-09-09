import type { NextFunction } from "express";

import { AuthRequest } from "../interface/auth-request.interface";
import { TypedResponse } from "../types/types";

import type {
  CreateSupplierPaymentRequest,
  CreateSupplierPurchaseRequest,
  SupplierPaymentResponse,
  SupplierPurchaseQuery,
  SupplierPurchaseResponse,
} from "../types/supplierPurchase.types";

import {
  createSupplierPaymentService,
  createSupplierPurchaseService,
  getSupplierPurchaseByIdService,
  getSupplierPurchasesService,
  getSupplierPurchaseSummaryService,
  getSupplierSummaryService,
  getSupplierTransactionsService,
} from "../services/supplierPurchase.service";
import { sendSuccess } from "../shared/responses";
import { catchAsync } from "../utils/catchAsync";

export const createSupplierPurchase = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SupplierPurchaseResponse>,
    next: NextFunction,
  ) => {
    const result = await createSupplierPurchaseService(
      req.user!.shopId,
      req.user!.userId,
      req.body as CreateSupplierPurchaseRequest,
    );

    return sendSuccess(res as any, {
      message: "Supplier purchase created successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getSupplierPurchases = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const result = await getSupplierPurchasesService(
      req.user!.shopId,
      req.query as SupplierPurchaseQuery,
    );

    return sendSuccess(res as any, {
      message: "Supplier purchases fetched successfully",
      data: result,
    });
  },
);

export const getSupplierPurchaseById = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const purchaseId = String(req.params.id);

    const result = await getSupplierPurchaseByIdService(
      req.user!.shopId,
      purchaseId,
    );

    return sendSuccess(res as any, {
      message: "Supplier purchase fetched successfully",
      data: result,
    });
  },
);

export const createSupplierPayment = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SupplierPaymentResponse>,
    next: NextFunction,
  ) => {
    const result = await createSupplierPaymentService(
      req.user!.shopId,
      req.user!.userId,
      req.body as CreateSupplierPaymentRequest,
    );

    return sendSuccess(res as any, {
      message: "Supplier payment recorded successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getSupplierTransactions = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const supplierId = String(req.params.supplierId);

    const result = await getSupplierTransactionsService(
      req.user!.shopId,
      supplierId,
    );

    return sendSuccess(res, {
      message: "Supplier transactions fetched successfully",
      data: result,
    });
  },
);

export const getSupplierSummary = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const supplierId = String(req.params.supplierId);

    const result = await getSupplierSummaryService(
      req.user!.shopId,
      supplierId,
    );

    return sendSuccess(res, {
      message: "Supplier summary fetched successfully",
      data: result,
    });
  },
);

export const getSupplierPurchaseSummary = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const result = await getSupplierPurchaseSummaryService(req.user!.shopId);

    return sendSuccess(res, {
      message: "Supplier purchase summary fetched successfully",
      data: result,
    });
  },
);
