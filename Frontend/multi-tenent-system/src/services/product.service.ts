/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "../api/axios";

export const getProducts = async ({
  page,
  limit,
  search,
  category,
  sort,
}: any) => {
  const params: any = {
    page,
    limit,
  };

  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const response = await api.get("/products", { params });

  return response.data;
};

export const createProduct = async (product: FormData) => {
  const response = await api.post("/products", product);

  return response.data;
};

export const updateProduct = async (id: string, payload: FormData) => {
  const response = await api.patch(`/products/${id}`, payload);

  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);

  return response.data;
};

export const getLowStockProducts = async ({
  page,
  limit,
  search,
  category,
  sort,
}: any) => {
  const params: any = {
    page,
    limit,
  };

  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const response = await api.get("/products/low-stock", { params });

  return response.data;
};

export const exportProducts = async (params?: {
  search?: string;
  category?: string;
}) => {
  const response = await api.get("/products/export", {
    params,
    responseType: "blob",
  });

  return response.data;
};
