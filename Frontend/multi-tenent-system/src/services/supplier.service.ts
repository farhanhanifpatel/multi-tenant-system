/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "../api/axios";

import type {
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "../types/supplier.types";

export const getSuppliers = async ({ page, limit, search, sort }: any) => {
  const params: any = {
    page,
    limit,
    search,
    sort,
  };

  if (search) params.search = search;

  if (sort) params.sort = sort;

  const response = await api.get("/suppliers", {
    params,
  });

  return response.data;
};

export const createSupplier = async (payload: CreateSupplierRequest) => {
  const response = await api.post("/suppliers", payload);

  return response.data;
};

export const updateSupplier = async (
  id: string,
  payload: UpdateSupplierRequest,
) => {
  const response = await api.patch(`/suppliers/${id}`, payload);

  return response.data;
};

export const deleteSupplier = async (id: string) => {
  const response = await api.delete(`/suppliers/${id}`);

  return response.data;
};

export const getSupplierById = async (id: string) => {
  const response = await api.get(`/suppliers/${id}`);

  return response.data;
};
