export interface CreateCreditRequest {
  customerId: string;
  amount: number;
  note?: string;
}

export interface TransactionResponse {
  transactionId: string;
  customerId: string;
  amount: number;
  type: string;
  note?: string;
}
