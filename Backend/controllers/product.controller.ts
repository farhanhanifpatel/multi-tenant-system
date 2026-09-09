import mongoose from "mongoose";
import { NextFunction, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../shared/responses";

import { AuthRequest } from "../interface/auth-request.interface";

import {
  createProductService,
  deleteProductService,
  getLowStockProductsService,
  getProductByIdService,
  getProductsService,
  getProductStatsService,
  updateProductService,
} from "../services/product.service";
import { ProductResponse } from "../types/product.types";
import { StdResponse, LoginResponse, TypedResponse } from "../types/types";
import { AppError } from "../shared/AppError";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../validation/product.validation";
import { exportProductsService } from "../services/product-export.service";

export const createProduct = catchAsync(
  async (
    req: AuthRequest,
    res: Response<
      StdResponse<ProductResponse | null>,
      { user: LoginResponse; data: any }
    >,
  ) => {
    const payload: CreateProductRequest = {
      ...req.body,
      image: req.file?.path || "",
    };

    const result = await createProductService(req.user!.shopId, payload);

    return sendSuccess(res, {
      message: "Product created successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getProducts = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getProductsService(
      req.user!.shopId,
      req.query as Record<string, any>,
    );

    return sendSuccess(res, {
      message: "Products fetched successfully",
      data: result,
    });
  },
);

export const exportProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const shopId = req.user!.shopId;

    const buffer = await exportProductsService(
      shopId,
      req.query as Record<string, any>,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="products.xlsx"',
    );

    res.send(buffer);
  },
);

export const getProductById = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const productId = String(req.params.id);

    const result = await getProductByIdService(req.user!.shopId, productId);

    return sendSuccess(res, {
      message: "Product fetched successfully",
      data: result,
    });
  },
);

export const deleteProduct = catchAsync(
  async (req: AuthRequest, res: TypedResponse<null>) => {
    const productId = String(req.params.id);
    await deleteProductService(req.user!.shopId, productId);

    return sendSuccess(res, {
      message: "Product deleted successfully",
      data: null,
    });
  },
);

export const updateProduct = catchAsync(
  async (
    req: AuthRequest,
    res: Response<
      StdResponse<ProductResponse | null>,
      { user: LoginResponse; data: any }
    >,
  ) => {
    const payload: UpdateProductRequest = {
      ...req.body,
    };

    if (req.file) {
      payload.image = req.file.path;
    }

    const productId = String(req.params.id);
    const result = await updateProductService(
      req.user!.shopId,
      productId,
      payload,
    );

    return sendSuccess(res, {
      message: "Product updated successfully",
      data: result,
    });
  },
);

export const getLowStockProducts = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getLowStockProductsService(
      req.user!.shopId,
      req.query,
    );

    return sendSuccess(res, {
      message: "Low stock products fetched successfully",
      data: result,
    });
  },
);

export const getProductStats = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getProductStatsService(req.user!.shopId);

    return sendSuccess(res, {
      message: "Product statistics fetched successfully",
      data: result,
    });
  },
);
