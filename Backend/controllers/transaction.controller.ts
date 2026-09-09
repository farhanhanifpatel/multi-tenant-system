import { catchAsync } from "../utils/catchAsync";

import { sendSuccess } from "../shared/responses";

import { AuthRequest } from "../interface/auth-request.interface";

import { TypedResponse, RequestWithBody } from "../types/types";

import {
  CreateCreditRequest,
  TransactionResponse,
} from "../types/transaction.types";

import {
  createCreditService,
  createPaymentService,
  deleteTransactionService,
  getCustomerBalanceService,
  getCustomerLedgerService,
  getOutstandingService,
} from "../services/transaction.service";

export const createCredit = catchAsync(
  async (
    req: AuthRequest & RequestWithBody<CreateCreditRequest>,
    res: TypedResponse<TransactionResponse>,
  ) => {
    const result = await createCreditService(
      req.user!.shopId,
      req.user!.userId,
      req.body,
    );

    return sendSuccess(res, {
      message: "Credit added successfully",
      data: result,
      statusCode: 201,
    });
  },
);

export const getCustomerLedger = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const customerId = String(req.params.customerId);
    const result = await getCustomerLedgerService(req.user!.shopId, customerId);

    return sendSuccess(res, {
      message: "Ledger fetched successfully",
      data: result,
    });
  },
);

export const getCustomerBalance = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const customerId = String(req.params.customerId);
    const result = await getCustomerBalanceService(
      req.user!.shopId,
      customerId,
    );

    return sendSuccess(res, {
      message: "Balance fetched successfully",
      data: result,
    });
  },
);

export const getOutstanding = catchAsync(
  async (req: AuthRequest, res: TypedResponse<any>) => {
    const result = await getOutstandingService(req.user!.shopId, req.query);

    return sendSuccess(res, {
      message: "Outstanding fetched successfully",
      data: result,
    });
  },
);

export const deleteTransaction = catchAsync(
  async (req: AuthRequest, res: TypedResponse<null>) => {
    const transactionId = String(req.params.id);
    await deleteTransactionService(req.user!.shopId, transactionId);

    return sendSuccess(res, {
      message: "Transaction deleted successfully",
      data: null,
    });
  },
);

export const createPayment = catchAsync(
  async (
    req: AuthRequest & RequestWithBody<CreateCreditRequest>,
    res: TypedResponse<TransactionResponse>,
  ) => {
    const result = await createPaymentService(
      req.user!.shopId,
      req.user!.userId,
      req.body,
    );

    return sendSuccess(res, {
      message: "Payment added successfully",
      data: result,
      statusCode: 201,
    });
  },
);
