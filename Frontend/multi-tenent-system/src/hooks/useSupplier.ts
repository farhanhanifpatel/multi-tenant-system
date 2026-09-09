import { useQuery, useMutation } from "@tanstack/react-query";

import { getSuppliers } from "../services/supplier.service";

import { createSupplier } from "../services/supplier.service";

interface UseSupplierParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
}

export const useSupplier = ({
  page,
  limit,
  search,
  sort,
}: UseSupplierParams) => {
  return useQuery({
    queryKey: ["suppliers", page, limit, search, sort],
    queryFn: () =>
      getSuppliers({
        page,
        limit,
        search,
        sort,
      }),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateSupplier = () => {
  return useMutation({
    mutationFn: createSupplier,
  });
};
