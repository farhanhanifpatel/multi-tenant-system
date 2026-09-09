import { NextFunction } from "express";

import { AuthRequest } from "../interface/auth-request.interface";

import { catchAsync } from "../utils/catchAsync";

import { sendSuccess } from "../shared/responses";

import { TypedResponse } from "../types/types";

import {
  createSaleService,
  getSaleByIdService,
  getSalesService,
  getSalesTrendService,
  getTopProductsService,
} from "../services/sale.service";

import { CreateSaleRequest } from "../validation/sale.validation";

import { SaleResponse } from "../types/sale.type";

export const createSale = catchAsync(
  async (
    req: AuthRequest,
    res: TypedResponse<SaleResponse>,
    next: NextFunction,
  ) => {
    const result = await createSaleService(
      req.user!.shopId,
      req.user!.userId,
      req.body as CreateSaleRequest,
    );

    return sendSuccess(res, {
      message: "Sale created successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getSalesTrend = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const data = await getSalesTrendService(req.user!.shopId);
    return sendSuccess(res, {
      message: "Sales trend fetched successfully",
      data,
    });
  },
);

export const getTopProducts = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const data = await getTopProductsService(req.user!.shopId);
    return sendSuccess(res, {
      message: "Top products fetched successfully",
      data,
    });
  },
);

export const getSales = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>, next: NextFunction) => {
    const data = await getSalesService(req.user!.shopId, req.query);
    return sendSuccess(res, {
      message: "Sales fetched successfully",
      data,
    });
  },
);

export const getSaleById = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const salesId = String(req.params.id);
    const result = await getSaleByIdService(req.user!.shopId, salesId);

    return sendSuccess(res as any, {
      message: "Sale fetched successfully",
      data: result,
    });
  },
);
