import { useQuery } from "@tanstack/react-query";
import { getLowStockProducts } from "@/services/product.service";

export const useLowStockProducts = (params: {
  page: number;
  limit: number;
  search: string;
  category: string;
  sort: string;
}) => {
  return useQuery({
    queryKey: ["low-stock-products", params],
    queryFn: () => getLowStockProducts(params),
  });
};
