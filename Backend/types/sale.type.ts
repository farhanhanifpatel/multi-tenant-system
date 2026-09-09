export interface SaleResponse {
  saleId: string;

  totalAmount: number;

  paidAmount: number;

  dueAmount: number;

  paymentMethod: string;

  paymentStatus: string;
}
