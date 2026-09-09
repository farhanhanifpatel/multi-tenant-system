import { AuthRequest } from "../interface/auth-request.interface";
import { getDashboardStatsService } from "../services/dashboard.service";
import { sendSuccess } from "../shared/responses";
import { TypedResponse } from "../types/types";
import { catchAsync } from "../utils/catchAsync";

export const getDashboardStats = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getDashboardStatsService(req.user!.shopId);

    return sendSuccess(res, {
      message: "Dashboard stats fetched successfully",
      data: result,
    });
  },
);
