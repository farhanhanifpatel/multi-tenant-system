import { Request, NextFunction } from "express";

import {
  getMeService,
  loginService,
  registerService,
  updateProfileService,
} from "../services/auth.service";
import { RequestWithBody } from "../types/api.type";
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../shared/responses";
import {
  LoginResponse,
  TypedResponse,
  UpdateProfileResponse,
} from "../types/types";
import { generateToken } from "../utils/jwt";
import { AuthRequest } from "../interface/auth-request.interface";
import { UpdateProfileRequest } from "../validation/profile.validation";

export const register = catchAsync(
  async (
    req: RequestWithBody<RegisterRequest>,
    res: TypedResponse<RegisterResponse>,
    next: NextFunction,
  ) => {
    const result = await registerService(req.body);
    const token = generateToken(result.userId, result.shopId);

    return sendSuccess(res, {
      message: "Shop registered successfully",
      data: { ...result, accessToken: token },
      statusCode: 201,
    });
  },
);

export const login = catchAsync(
  async (
    req: RequestWithBody<LoginRequest>,
    res: TypedResponse<LoginResponse>,
    next: NextFunction,
  ) => {
    const result = await loginService(req.body);

    const token = generateToken(result.userId, result.shopId);

    return sendSuccess(res, {
      message: "Login successful",
      data: {
        ...result,
        accessToken: token,
      },
    });
  },
);

export const getMe = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getMeService(req.user!.userId);

    return sendSuccess(res, {
      message: "User fetched successfully",
      data: result,
    });
  },
);

export const logout = catchAsync(
  async (req: Request, res: TypedResponse<null>, next: NextFunction) => {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return sendSuccess(res, {
      message: "Logout successful",
      data: null,
    });
  },
);

export const updateProfile = catchAsync(
  async (
    req: AuthRequest & RequestWithBody<UpdateProfileRequest>,
    res: TypedResponse<UpdateProfileResponse>,
    next: NextFunction,
  ) => {
    const result = await updateProfileService(
      req.user!.userId,
      req.user!.shopId,
      req.body,
    );

    return sendSuccess(res, {
      message: "Profile updated successfully",
      data: result,
      statusCode: 200,
    });
  },
);
