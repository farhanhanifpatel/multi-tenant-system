import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface StdResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
}

export type TypedResponse<T> = Response<StdResponse<T>>;

export type RequestWithBody<T> = Request<ParamsDictionary, any, T>;
