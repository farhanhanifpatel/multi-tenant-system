import { useQuery } from "@tanstack/react-query";
import { getSales } from "../services/sale.service";

export const useSales = ({
  page,
  limit,
  search,
  sort,
}: {
  page: number;
  limit: number;
  search: string;
  sort: string;
}) => {
  return useQuery({
    queryKey: ["sales", page, limit, search, sort],
    queryFn: () =>
      getSales({
        page,
        limit,
        search,
        sort,
      }),
  });
};
