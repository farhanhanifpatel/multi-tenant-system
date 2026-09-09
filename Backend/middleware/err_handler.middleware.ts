import { Request, NextFunction } from "express";
import { TypedResponse } from "../types/types";
import { sendError } from "../shared/responses";
import { AppError } from "../shared/AppError";
import { ZodError } from "zod";

export const errorHandling = (
  err: unknown,
  req: Request,
  res: TypedResponse<null>,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let error: any = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";

    error = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof Error) {
    message = err.message;
  }

  return sendError(res, {
    statusCode,
    message,
    error,
  });
};
