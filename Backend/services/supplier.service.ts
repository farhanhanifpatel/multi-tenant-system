import mongoose from "mongoose";

import { Supplier } from "../models/supplier.model";

import type {
  CreateSupplierRequest,
  UpdateSupplierRequest,
  SupplierQuery,
} from "../types/supplier.types";

import { AppError } from "../shared/AppError";
import { APIFeatures } from "../utils/apiFeatures";

/* =========================================================
   CREATE SUPPLIER
========================================================= */

export const createSupplierService = async (
  shopId: string,
  payload: CreateSupplierRequest,
) => {
  // =========================================================
  // 1. BASIC VALIDATION
  // =========================================================

  const name = payload.name?.trim();
  const mobile = payload.mobile?.trim();
  const companyName = payload.companyName?.trim();
  const email = payload.email?.trim().toLowerCase();
  const address = payload.address?.trim();
  const taxNumber = payload.taxNumber?.trim();
  const notes = payload.notes?.trim();

  if (!name) {
    throw new AppError("Supplier name is required", 400);
  }

  if (name.length < 2) {
    throw new AppError("Supplier name must be at least 2 characters", 400);
  }

  if (!mobile) {
    throw new AppError("Supplier mobile is required", 400);
  }

  if (!email) {
    throw new AppError("Supplier email is required", 400);
  }

  // =========================================================
  // 2. CHECK DUPLICATE SUPPLIER
  // =========================================================

  const existingSupplier = await Supplier.findOne({
    shopId,
    $or: [{ mobile }, ...(email ? [{ email }] : [])],
  }).select("_id mobile email");

  if (existingSupplier) {
    if (existingSupplier.mobile === mobile) {
      throw new AppError(
        "A supplier with this mobile number already exists",
        409,
      );
    }

    if (email && existingSupplier.email === email) {
      throw new AppError("A supplier with this email already exists", 409);
    }
  }

  // =========================================================
  // 3. CREATE SUPPLIER
  // =========================================================

  try {
    const supplier = await Supplier.create({
      shopId,
      name,
      companyName: companyName || undefined,
      mobile,
      email: email || undefined,
      address: address || undefined,
      taxNumber: taxNumber || undefined,
      notes: notes || undefined,
      isActive: true,
    });

    return supplier;
  } catch (error: any) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern ?? {})[1];

      if (duplicateField === "mobile") {
        throw new AppError(
          "A supplier with this mobile number already exists",
          409,
        );
      }

      if (duplicateField === "email") {
        throw new AppError("A supplier with this email already exists", 409);
      }

      throw new AppError("Supplier already exists", 409);
    }

    throw error;
  }
};

/* =========================================================
   GET ALL SUPPLIERS
========================================================= */

export const getSuppliersService = async (
  shopId: string,
  queryParams: SupplierQuery,
) => {
  const filter: Record<string, any> = {
    shopId,
    isActive: true,
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  if (queryParams.search) {
    filter.$or = [
      {
        name: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        companyName: {
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

  /* =======================================================
     ACTIVE / INACTIVE FILTER
  ======================================================= */

  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === "true";
  }

  /* =======================================================
     TOTAL
  ======================================================= */

  const total = await Supplier.countDocuments(filter);

  /* =======================================================
     FEATURES
  ======================================================= */

  const features = new APIFeatures(Supplier.find(filter), queryParams)
    .sort()
    .limitFields()
    .paginate();

  const suppliers = await features.query;

  /* =======================================================
     PAGINATION
  ======================================================= */

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  return {
    suppliers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* =========================================================
   GET SUPPLIER BY ID
========================================================= */

export const getSupplierByIdService = async (
  shopId: string,
  supplierId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    throw new AppError("Invalid supplier id", 400);
  }

  const supplier = await Supplier.findOne({
    _id: supplierId,
    shopId,
    isActive: true,
  });

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  return supplier;
};

/* =========================================================
   UPDATE SUPPLIER
========================================================= */

export const updateSupplierService = async (
  shopId: string,
  supplierId: string,
  payload: UpdateSupplierRequest,
) => {
  // =========================================================
  // 1. VALIDATE SUPPLIER ID
  // =========================================================

  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    throw new AppError("Invalid supplier id", 400);
  }

  // =========================================================
  // 2. CHECK SUPPLIER EXISTS
  // =========================================================

  const supplier = await Supplier.findOne({
    _id: supplierId,
    shopId,
    isActive: true,
  });

  console.log("--->", supplier);
  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  // =========================================================
  // 3. NORMALIZE DATA
  // =========================================================

  const updateData: UpdateSupplierRequest = {
    ...payload,
  };

  if (updateData.name !== undefined) {
    updateData.name = updateData.name.trim();

    if (!updateData.name) {
      throw new AppError("Supplier name cannot be empty", 400);
    }
  }

  if (updateData.mobile !== undefined) {
    updateData.mobile = updateData.mobile.trim();

    if (!updateData.mobile) {
      throw new AppError("Supplier mobile cannot be empty", 400);
    }
  }

  if (updateData.email !== undefined) {
    updateData.email = updateData.email.trim().toLowerCase();

    if (!updateData.email) {
      throw new AppError("Supplier email cannot be empty", 400);
    }
  }

  if (updateData.companyName !== undefined) {
    updateData.companyName = updateData.companyName.trim();
  }

  if (updateData.address !== undefined) {
    updateData.address = updateData.address.trim();
  }

  if (updateData.taxNumber !== undefined) {
    updateData.taxNumber = updateData.taxNumber.trim();
  }

  if (updateData.notes !== undefined) {
    updateData.notes = updateData.notes.trim();
  }

  // =========================================================
  // 4. CHECK DUPLICATE MOBILE / EMAIL
  // =========================================================

  const duplicateConditions: Record<string, any>[] = [];

  if (
    updateData.mobile !== undefined &&
    updateData.mobile !== supplier.mobile
  ) {
    duplicateConditions.push({
      mobile: updateData.mobile,
    });
  }

  if (updateData.email !== undefined && updateData.email !== supplier.email) {
    duplicateConditions.push({
      email: updateData.email,
    });
  }

  if (duplicateConditions.length > 0) {
    const duplicateSupplier = await Supplier.findOne({
      shopId,
      _id: { $ne: supplierId },
      isActive: true,
      $or: duplicateConditions,
    }).select("_id mobile email");

    if (duplicateSupplier) {
      if (
        updateData.mobile !== undefined &&
        duplicateSupplier.mobile === updateData.mobile
      ) {
        throw new AppError(
          "A supplier with this mobile number already exists",
          409,
        );
      }

      if (
        updateData.email !== undefined &&
        duplicateSupplier.email === updateData.email
      ) {
        throw new AppError("A supplier with this email already exists", 409);
      }
    }
  }
  // =========================================================
  // 5. UPDATE
  // =========================================================

  try {
    const updatedSupplier = await Supplier.findOneAndUpdate(
      {
        _id: supplierId,
        shopId,
        isActive: true,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedSupplier) {
      throw new AppError("Supplier not found", 404);
    }

    return updatedSupplier;
  } catch (error: any) {
    // MongoDB duplicate key protection
    if (error?.code === 11000) {
      throw new AppError(
        "Supplier with the provided mobile or email already exists",
        409,
      );
    }

    throw error;
  }
};

/* =========================================================
   DELETE SUPPLIER
========================================================= */

export const deleteSupplierService = async (
  shopId: string,
  supplierId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(supplierId)) {
    throw new AppError("Invalid supplier id", 400);
  }

  const supplier = await Supplier.findOneAndUpdate(
    {
      _id: supplierId,
      shopId,
      isActive: true,
    },
    {
      $set: {
        isActive: false,
      },
    },
    {
      new: true,
    },
  );

  if (!supplier) {
    throw new AppError("Supplier not found", 404);
  }

  return supplier;
};
