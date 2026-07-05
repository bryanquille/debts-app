import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ debtId, data }: { debtId: string; data: FormData }) => {
      const res = await api.post(`/debts/${debtId}/payments`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (_data, { debtId }) => {
      queryClient.invalidateQueries({ queryKey: ["debts", debtId] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
