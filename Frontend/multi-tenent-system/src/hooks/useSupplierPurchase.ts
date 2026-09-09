import { useQuery } from "@tanstack/react-query";

import { getSupplierPurchases } from "../services/supplier-purchase.service";

interface UseSupplierPurchaseParams {
  page: number;
  limit: number;
  search: string;
  sort: string;
  supplierId?: string;
  paymentStatus?: "PAID" | "PARTIAL" | "UNPAID";
}

export const useSupplierPurchase = ({
  page,
  limit,
  search,
  sort,
  supplierId,
  paymentStatus,
}: UseSupplierPurchaseParams) => {
  return useQuery({
    queryKey: [
      "supplier-purchases",
      page,
      limit,
      search,
      sort,
      supplierId,
      paymentStatus,
    ],

    queryFn: () =>
      getSupplierPurchases({
        page,
        limit,
        search,
        sort,
        supplierId,
        paymentStatus,
      }),

    placeholderData: (previousData) => previousData,
  });
};
