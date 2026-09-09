/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "../api/axios";
import type { Customer } from "../types/customer.types";

export const getCustomers = async ({ page, limit, search, sort }: any) => {
  const params: any = {
    page,
    limit,
    search,
    sort,
  };

  if (search) params.search = search;
  if (sort) params.sort = sort;

  const response = await api.get("/customers", {
    params,
  });

  return response.data;
};

export const createCustomer = async (payload: Customer) => {
  const response = await api.post("/customers", payload);

  return response.data;
};

export const updateCustomer = async (
  id: string,
  payload: Partial<Customer>,
) => {
  const response = await api.patch(`/customers/${id}`, payload);

  return response.data;
};

export const deleteCustomer = async (id: string) => {
  const response = await api.delete(`/customers/${id}`);

  return response.data;
};

export const getCustomerById = async (id: string) => {
  const response = await api.get(`/customers/${id}`);

  return response.data;
};
