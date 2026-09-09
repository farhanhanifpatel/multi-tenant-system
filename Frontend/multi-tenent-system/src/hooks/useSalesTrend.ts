import { useQuery } from "@tanstack/react-query";
import { getSalesTrend } from "../services/dashboard.service";

export const useSalesTrend = () => {
  return useQuery({
    queryKey: ["sales-trend"],
    queryFn: getSalesTrend,
  });
};
