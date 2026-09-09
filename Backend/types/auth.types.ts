import { BusinessType } from "../constants/business-type";
import { SubscriptionStatus } from "../constants/subscription-plan";
import UserRole from "../constants/roles";

export interface UserResponse {
  userId: string;
  shopId: string;
  name: string;
  email: string;
  mobile: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse extends UserResponse {
  role: UserRole;
}

export interface RegisterRequest {
  shopName: string;
  ownerName: string;
  email: string;
  mobile: string;
  password: string;
  businessType: BusinessType;
  address?: string;
}

export interface RegisterResponse extends UserResponse {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date;
}

export interface AuthUser {
  id(
    shopId: string,
    id: any,
    arg2: {
      paymentMethod: "CASH" | "UPI" | "CARD";
      paidAmount: number;
      items: { productId: string; quantity: number }[];
      customerId?: string | undefined;
    },
  ): unknown;
  userId: string;
  shopId: string;
  role: UserRole;
}

export interface CustomJwtPayload {
  userId: string;
  shopId: string;
  role: UserRole;
}
