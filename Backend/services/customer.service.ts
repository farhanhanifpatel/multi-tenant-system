import mongoose, { Types } from "mongoose";
import { Customer } from "../models/customer.model";
import { AppError } from "../shared/AppError";
import {
  CreateCustomerRequest,
  CustomerResponse,
} from "../types/customer.types";
import { APIFeatures } from "../utils/apiFeatures";

export const createCustomerService = async (
  shopId: string,
  payload: CreateCustomerRequest,
): Promise<CustomerResponse> => {
  const existingCustomer = await Customer.findOne({
    shopId,
    mobile: payload.mobile,
    isActive: true,
  });

  if (existingCustomer) {
    throw new AppError("Customer already exists with this mobile number", 409);
  }

  const customer = await Customer.create({
    shopId: new Types.ObjectId(shopId),
    name: payload.name,
    mobile: payload.mobile,
    address: payload.address,
  });

  return {
    customerId: customer._id.toString(),
    name: customer.name,
    mobile: customer.mobile,
    address: customer.address,
  };
};

export const getCustomersService = async (
  shopId: string,
  queryParams: Record<string, any>,
) => {
  const filter: Record<string, any> = {
    shopId,
    isActive: true,
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

  const features = new APIFeatures(Customer.find(filter), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const customers = await features.query;

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  return {
    customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCustomerByIdService = async (
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

  return customer;
};

export const updateCustomerService = async (
  shopId: string,
  customerId: string,
  payload: {
    name?: string;
    mobile?: string;
    address?: string;
  },
) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new AppError("Invalid customer id", 400);
  }

  const existingCustomer = await Customer.findOne({
    shopId,
    mobile: payload.mobile,
    _id: { $ne: customerId },
    isActive: true,
  });

  if (existingCustomer) {
    throw new AppError("Customer already exists with this mobile number", 409);
  }

  const customer = await Customer.findOneAndUpdate(
    {
      _id: customerId,
      shopId,
      isActive: true,
    },
    payload,
    {
      new: true,
    },
  );

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return customer;
};

export const deleteCustomerService = async (
  shopId: string,
  customerId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new AppError("Invalid customer id", 400);
  }

  const customer = await Customer.findOneAndUpdate(
    {
      _id: customerId,
      shopId,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      new: true,
    },
  );

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  return null;
};
