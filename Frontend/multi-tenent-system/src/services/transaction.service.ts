import { api } from "../api/axios";

export const createPayment = async (payload: {
  customerId: string;
  amount: number;
  paymentMethod: string;
  note?: string;
}) => {
  const { data } = await api.post("/transactions/payment", payload);

  return data;
};

export const customerLedger = async (customerId: string) => {
  const { data } = await api.get(`/transactions/customer/${customerId}`);

  return data;
};

export const customerOutstanding = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}) => {
  const { data } = await api.get("/transactions/outstanding", {
    params,
  });

  return data;
};
