/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "../api/axios";
import type { Sale } from "../types/sale.types";

export const getSales = async ({ page, limit, search, sort }: any) => {
  const params: any = {
    page,
    limit,
  };

  if (search) params.search = search;
  if (sort) params.sort = sort;

  const response = await api.get("/sales/get-sales", {
    params,
  });

  return response.data;
};

export const getSaleById = async (id: string) => {
  const response = await api.get(`/sales/${id}`);

  return response.data;
};

export const createSale = async (payload: Sale) => {
  const response = await api.post("/sales", payload);

  return response.data;
};
