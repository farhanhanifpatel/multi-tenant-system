import { IShop } from "../interface/register.interface";
import User from "../models/user.model";
import Shop from "../models/shop.model";
import { AppError } from "../shared/AppError";
import { generateSlug } from "../utils/slug";
import { compareHash, createHash } from "../shared/hashing";
import mongoose from "mongoose";
import { SubscriptionStatus } from "../constants/subscription-plan";
import UserRole from "../constants/roles";
import { LoginResponse } from "../types/types";
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";

export const registerService = async (
  payload: RegisterRequest,
): Promise<RegisterResponse> => {
  const {
    shopName,
    ownerName,
    email,
    mobile,
    password,
    businessType,
    address,
  } = payload;

  const existingEmail = await User.findOne({ email });

  if (existingEmail) {
    throw new AppError("Email already registered", 409);
  }

  const existingMobile = await User.findOne({ mobile });

  if (existingMobile) {
    throw new AppError("Mobile already registered", 409);
  }

  const slug = generateSlug(shopName);

  const existingShop = await Shop.findOne({ slug });

  if (existingShop) {
    throw new AppError("Shop name already exists", 409);
  }

  const passwordHash = await createHash(password);

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 15);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [shop] = await Shop.create(
      [
        {
          shopName,
          ownerName,
          email,
          mobile,
          businessType,
          address,
          slug,
          isActive: true,
          subscriptionStatus: SubscriptionStatus.TRIAL,
          trialEndsAt,
        },
      ],
      { session },
    );

    const [user] = await User.create(
      [
        {
          shopId: shop._id,
          name: ownerName,
          email,
          mobile,
          password: passwordHash,
          role: UserRole.TENANT_ADMIN,
          isActive: true,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    return {
      userId: user._id.toString(),
      shopId: shop._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      subscriptionStatus: shop.subscriptionStatus,
      trialEndsAt: shop.trialEndsAt,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (
  payload: LoginRequest,
): Promise<LoginResponse> => {
  const { email, password } = payload;

  const user = await User.findOne({ email }).populate("shopId");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await compareHash(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 403);
  }

  return {
    userId: user._id.toString(),
    shopId: user.shopId._id.toString(),
    name: user.name,
    email: user.email,
    // mobile: user.mobile,
    // role: user.role,
  };
};

export const getMeService = async (userId: string) => {
  const user = await User.findById(userId)
    .populate("shopId", "shopName")
    .select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
