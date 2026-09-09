import { ParamsDictionary } from "express-serve-static-core";
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
