import { PaymentMethod } from "../constants/payments";

/* =========================================================
   SUPPLIER PURCHASE ITEM
========================================================= */

export interface SupplierPurchaseItemRequest {
  productId: string;
  quantity: number;
  purchasePrice: number;
}

/* =========================================================
   CREATE SUPPLIER PURCHASE
========================================================= */

export interface CreateSupplierPurchaseRequest {
  supplierId: string;
  items: SupplierPurchaseItemRequest[];
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}

/* =========================================================
   SUPPLIER PURCHASE RESPONSE
========================================================= */

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
  paymentMethod?: "CASH" | "CARD" | "BANK" | "UPI" | "OTHER";
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
