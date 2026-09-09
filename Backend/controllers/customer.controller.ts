import { NextFunction } from "express";

import { catchAsync } from "../utils/catchAsync";

import { AuthRequest } from "../interface/auth-request.interface";

import {
  CreateCustomerRequest,
  CustomerResponse,
} from "../types/customer.types";

import { RequestWithBody, TypedResponse } from "../types/api.type";

import { sendSuccess } from "../shared/responses";

import {
  createCustomerService,
  deleteCustomerService,
  getCustomerByIdService,
  getCustomersService,
  updateCustomerService,
} from "../services/customer.service";

export const createCustomer = catchAsync(
  async (
    req: AuthRequest & RequestWithBody<CreateCustomerRequest>,
    res: TypedResponse<CustomerResponse>,
  ) => {
    const result = await createCustomerService(req.user!.shopId, req.body);

    return sendSuccess(res as any, {
      message: "Customer created successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getCustomers = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getCustomersService(req.user!.shopId, req.query);

    return sendSuccess(res as any, {
      message: "Customers fetched successfully",
      data: result,
    });
  },
);

export const getCustomerById = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const customerId = String(req.params.id);

    const result = await getCustomerByIdService(req.user!.shopId, customerId);

    return sendSuccess(res as any, {
      message: "Customer fetched successfully",
      data: result,
    });
  },
);

export const updateCustomer = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const customerId = String(req.params.id);
    const result = await updateCustomerService(
      req.user!.shopId,
      customerId,
      req.body,
    );

    return sendSuccess(res as any, {
      message: "Customer updated successfully",
      data: result,
    });
  },
);

export const deleteCustomer = catchAsync(
  async (req: AuthRequest, res: TypedResponse<null>) => {
    const customerId = String(req.params.id);
    await deleteCustomerService(req.user!.shopId, customerId);

    return sendSuccess(res as any, {
      message: "Customer deleted successfully",
      data: null,
    });
  },
);
