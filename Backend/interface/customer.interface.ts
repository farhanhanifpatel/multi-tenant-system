import { Types } from "mongoose";

export interface ICustomer {
  shopId: Types.ObjectId;

  name: string;

  mobile: string;

  address?: string;

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
  dueAmount?: number;
}
