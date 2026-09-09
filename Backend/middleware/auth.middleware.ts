import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../shared/AppError";

import { AuthRequest } from "../interface/auth-request.interface";
import { CustomJwtPayload } from "../types/auth.types";
import { any } from "zod";

export const authMiddleware = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return next(new AppError("Unauthorized! Please log in.", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as CustomJwtPayload;

    req.user = {
      id: any,
      userId: decoded.userId,
      shopId: decoded.shopId,
      role: decoded.role,
    };

    next();
  },
);
