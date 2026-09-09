import { type PaymentMethod } from "../constant/payments";

export interface SupplierPurchaseItemRequest {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

export interface CreateSupplierPurchaseRequest {
  supplierId: string;
  items: SupplierPurchaseItemRequest[];
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}

export interface SupplierPurchaseResponse {
  purchaseId: string;
  supplierId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}

export interface SupplierPurchaseQuery {
  supplierId?: string;
  paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

export interface CreateSupplierPaymentRequest {
  supplierId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}

export interface SupplierPaymentResponse {
  paymentId: string;
  supplierId: string;
  amount: number;
  remainingDue: number;
  paymentMethod?: string;
  note?: string;
}

export interface GetSupplierPurchasesParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  supplierId?: string;
  paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
  startDate?: string;
  endDate?: string;
}
