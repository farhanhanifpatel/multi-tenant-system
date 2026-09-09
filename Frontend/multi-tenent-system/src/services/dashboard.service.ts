import { api } from "../api/axios";

export const getDashboardStats = async () => {
  const response = await api.get("/stats");

  return response.data;
};

export const getSalesTrend = async () => {
  const response = await api.get("/sales/sales-trend");

  return response.data.data;
};

export const getTopProducts = async () => {
  const response = await api.get("/sales/top-products");

  return response.data;
};
