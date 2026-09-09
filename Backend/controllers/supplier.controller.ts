import type { NextFunction } from "express";

import { AuthRequest } from "../interface/auth-request.interface";
import type {
  SupplierResponse,
  CreateSupplierRequest,
  SupplierQuery,
  UpdateSupplierRequest,
} from "../types/supplier.types";

import {
  createSupplierService,
  deleteSupplierService,
  getSupplierByIdService,
  getSuppliersService,
  updateSupplierService,
} from "../services/supplier.service";
import { sendSuccess } from "../shared/responses";
import { catchAsync } from "../utils/catchAsync";
import { TypedResponse } from "../types/api.type";

export const createSupplier = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SupplierResponse>,
    next: NextFunction,
  ) => {
    const result = await createSupplierService(
      req.user!.shopId,
      req.body as CreateSupplierRequest,
    );

    return sendSuccess(res as any, {
      message: "Supplier created successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getSuppliers = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const result = await getSuppliersService(
      req.user!.shopId,
      req.query as SupplierQuery,
    );

    return sendSuccess(res as any, {
      message: "Suppliers fetched successfully",
      data: result,
    });
  },
);

export const getSupplierById = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SupplierResponse>,
    next: NextFunction,
  ) => {
    const supplierId = String(req.params.id);

    const result = await getSupplierByIdService(req.user!.shopId, supplierId);

    return sendSuccess(res as any, {
      message: "Supplier fetched successfully",
      data: result,
    });
  },
);

export const updateSupplier = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SupplierResponse>,
    next: NextFunction,
  ) => {
    const supplierId = String(req.params.id);

    const result = await updateSupplierService(
      req.user!.shopId,
      supplierId,
      req.body as UpdateSupplierRequest,
    );

    return sendSuccess(res as any, {
      message: "Supplier updated successfully",
      data: result,
    });
  },
);

export const deleteSupplier = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SupplierResponse>,
    next: NextFunction,
  ) => {
    const supplierId = String(req.params.id);

    const result = await deleteSupplierService(req.user!.shopId, supplierId);

    return sendSuccess(res as any, {
      message: "Supplier deleted successfully",
      data: result,
    });
  },
);
