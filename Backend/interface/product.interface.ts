import { Types, Document } from "mongoose";

export interface IProduct extends Document {
  shopId: Types.ObjectId;

  name: string;
  sku: string;
  category: string;

  purchasePrice: number;
  sellingPrice: number;

  stock: number;
  lowStockThreshold: number;

  unit: string;

  image: string;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
