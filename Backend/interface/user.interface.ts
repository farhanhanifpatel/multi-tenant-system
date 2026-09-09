import { Types } from "mongoose";
import UserRole from "../constants/roles";

export interface IUser {
  shopId: Types.ObjectId;

  name: string;

  email: string;

  mobile: string;

  password: string;

  role: UserRole;

  isActive: boolean;

  lastLogin?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
