import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "./../services/customer.service";

export const useCustomer = (params: {
  page: number;
  limit: number;
  search: string;
  sort: string;
}) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });
};
