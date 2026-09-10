import { ParamsDictionary } from "express-serve-static-core";
import { SubscriptionStatus } from "../constants/subscription-plan";
export type TypedResponse<T> = import("express").Response<
  StdResponse<T | null>,
  { user: LoginResponse; data: any }
>;

export interface StdResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: any;
}

export type RequestWithBody<T> = import("express").Request<
  ParamsDictionary,
  null,
  T
>;

export type LoginResponse = {
  userId: string;
  name: string;
  email: string;
  shopId: string;
};

export type SignupResponse = {
  userId: string;
  name: string;
  email: string;
};

export interface UpdateProfileResponse {
  userId: string;
  shopId: string;
  name: string;
  email: string;
  mobile: string;
  shopName: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date;
}
