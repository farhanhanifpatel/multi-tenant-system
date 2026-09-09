import mongoose from "mongoose";
import Product from "../models/product.model";
import { AppError } from "../shared/AppError";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "../validation/product.validation";
import { ProductResponse } from "../types/product.types";
import { APIFeatures } from "../utils/apiFeatures";

export const createProductService = async (
  shopId: string,
  payload: CreateProductRequest,
): Promise<ProductResponse> => {
  const {
    name,
    sku,
    category,
    purchasePrice,
    sellingPrice,
    stock,
    lowStockThreshold,
    unit,
    image,
  } = payload;

  const existingProduct = await Product.findOne({
    shopId,
    sku,
  });

  if (existingProduct) {
    throw new AppError("SKU already exists", 409);
  }

  const product = await Product.create({
    shopId,
    name,
    sku,
    category,
    purchasePrice,
    sellingPrice,
    stock,
    lowStockThreshold,
    unit,
    image: image ?? "",
    isActive: true,
  });

  return {
    id: product._id.toString(),
    name: product.name,
    sku: product.sku,
    category: product.category,
    purchasePrice: product.purchasePrice,
    sellingPrice: product.sellingPrice,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    unit: product.unit,
    image: product.image,
    isActive: product.isActive,
  };
};

export const getProductsService = async (
  shopId: string,
  queryParams: Record<string, any>,
) => {
  const filter: Record<string, any> = {
    shopId,
    isActive: true,
  };

  // Search by name or SKU
  if (queryParams.search) {
    filter.$or = [
      {
        name: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
    ];
  }

  // Category filter
  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  // Count before pagination
  const total = await Product.countDocuments(filter);

  const features = new APIFeatures(Product.find(filter), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductByIdService = async (
  shopId: string,
  productId: string,
) => {
  const product = await Product.findOne({
    _id: productId,
    shopId,
    isActive: true,
  });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const deleteProductService = async (
  shopId: string,
  productId: string,
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product id", 400);
  }

  const deletedProduct = await Product.findOneAndUpdate(
    {
      _id: productId,
      shopId,
      isActive: true,
    },
    {
      isActive: false,
      deletedAt: new Date(),
    },
    {
      new: true,
    },
  );

  if (!deletedProduct) {
    throw new AppError("Product not found", 404);
  }
};

export const updateProductService = async (
  shopId: string,
  productId: string,
  payload: UpdateProductRequest,
) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new AppError("Invalid product id", 400);
  }

  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      shopId,
      isActive: true,
    },
    payload,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

export const getLowStockProductsService = async (
  shopId: string,
  queryParams: Record<string, any>,
) => {
  const filter: Record<string, any> = {
    shopId,
    isActive: true,
    $expr: {
      $lte: ["$stock", "$lowStockThreshold"],
    },
  };

  // Search
  if (queryParams.search) {
    filter.$or = [
      {
        name: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
      {
        sku: {
          $regex: queryParams.search,
          $options: "i",
        },
      },
    ];
  }

  // Category filter
  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  const total = await Product.countDocuments(filter);

  const features = new APIFeatures(Product.find(filter), queryParams)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductStatsService = async (shopId: string) => {
  const [totalProducts, activeProducts, lowStockProducts, inventoryStats] =
    await Promise.all([
      Product.countDocuments({
        shopId,
      }),

      Product.countDocuments({
        shopId,
        isActive: true,
      }),

      Product.countDocuments({
        shopId,
        isActive: true,
        $expr: {
          $lte: ["$stock", "$lowStockThreshold"],
        },
      }),

      Product.aggregate([
        {
          $match: {
            shopId: new Product.db.base.Types.ObjectId(shopId),
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            totalInventoryValue: {
              $sum: {
                $multiply: ["$stock", "$purchasePrice"],
              },
            },
          },
        },
      ]),
    ]);

  return {
    totalProducts,
    activeProducts,
    lowStockProducts,
    totalInventoryValue: inventoryStats[0]?.totalInventoryValue || 0,
  };
};
