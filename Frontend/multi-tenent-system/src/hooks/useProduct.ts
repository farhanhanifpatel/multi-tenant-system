import { useQuery, useMutation } from "@tanstack/react-query";
import { getProducts } from "./../services/product.service";

// import { useMutation } from "@tanstack/react-query";
import { exportProducts } from "../services/product.service";

export const useProducts = (params: {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: string;
}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });
};

export const useExportProducts = () => {
  return useMutation({
    mutationFn: (params?: { search?: string; category?: string }) =>
      exportProducts(params),
  });
};
