import { api } from "../api/axios";
import type {
  CreateSupplierPaymentRequest,
  CreateSupplierPurchaseRequest,
  GetSupplierPurchasesParams,
  SupplierPaymentResponse,
  SupplierPurchaseResponse,
} from "../types/supplierPurchase.types";

export const createSupplierPurchase = async (
  payload: CreateSupplierPurchaseRequest,
): Promise<SupplierPurchaseResponse> => {
  const response = await api.post<SupplierPurchaseResponse>(
    "/supplier-purchases",
    payload,
  );

  return response.data;
};
// export interface GetSupplierPurchasesParams {
//   page: number;
//   limit: number;
//   search?: string;
//   sort?: string;
// }

export const getSupplierPurchases = async ({
  page,
  limit,
  search,
  sort,
  supplierId,
  paymentStatus,
  startDate,
  endDate,
}: GetSupplierPurchasesParams) => {
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  if (search) {
    params.search = search;
  }

  if (sort) {
    params.sort = sort;
  }

  if (supplierId) {
    params.supplierId = supplierId;
  }

  if (paymentStatus) {
    params.paymentStatus = paymentStatus;
  }

  if (startDate) {
    params.startDate = startDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  const response = await api.get("/supplier-purchases", {
    params,
  });

  return response.data;
};

export const getSupplierPurchaseSummary = async () => {
  const response = await api.get("/supplier-purchases/summary");

  return response.data;
};

export const createSupplierPayment = async (
  payload: CreateSupplierPaymentRequest,
): Promise<SupplierPaymentResponse> => {
  const response = await api.post<SupplierPaymentResponse>(
    "/supplier-purchases/supplier-payments",
    payload,
  );

  return response.data;
};

export const getSupplierTransactions = async (supplierId: string) => {
  const response = await api.get(
    `/supplier-purchases/${supplierId}/transactions`,
  );

  return response.data;
};

export const getSupplierSummary = async (supplierId: string) => {
  const response = await api.get(`/supplier-purchases/${supplierId}/summary`);

  return response.data;
};

export const getSupplierPurchaseById = async (id: string) => {
  const response = await api.get(`/supplier-purchases/${id}`);

  return response.data;
};
