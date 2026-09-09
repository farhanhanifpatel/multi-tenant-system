import { StdResponse, TypedResponse } from "../types/types";
import "dotenv/config";
const isDev = process.env.NODE_ENV === "development";
export function sendSuccess<T>(
  res: TypedResponse<T>,
  options: {
    data: T;
    message?: string;
    statusCode?: number;
  },
) {
  const { data, message = "Success", statusCode = 200 } = options;

  const response: StdResponse<T> = {
    success: true,
    message,
    data,
    error: null,
  };

  return res.status(statusCode).json(response);
}

export function sendError(
  res: TypedResponse<null>,
  options: {
    statusCode?: number;
    message: string;
    error?: unknown;
  },
) {
  const { statusCode = 500, message, error = null } = options;
  const response: StdResponse<null> = {
    success: false,
    message,
    data: null,
    error: isDev ? error : null,
  };
  return res.status(statusCode).json(response);
}
