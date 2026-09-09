import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createPayment,
  customerOutstanding,
} from "../services/transaction.service";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,

    onSuccess: () => {
      console.log("Payment received successfully");

      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["sales"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      queryClient.invalidateQueries({
        queryKey: ["outstanding"],
      });
    },

    onError: () => {
      console.error("Unable to receive payment");
    },
  });
};

export const useOutstanding = (params: {
  page: number;
  limit: number;
  search: string;
  sort: string;
}) => {
  return useQuery({
    queryKey: ["outstanding", params],
    queryFn: () => customerOutstanding(params),
  });
};
