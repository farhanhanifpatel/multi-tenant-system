// hooks/useTopProducts.ts

import { useQuery } from "@tanstack/react-query";
import { getTopProducts } from "@/services/dashboard.service";

export const useTopProducts = () => {
  return useQuery({
    queryKey: ["top-products"],
    queryFn: getTopProducts,
  });
};
