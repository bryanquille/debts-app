import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Debt {
  id: string;
  title: string;
  description?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  role: "debtor" | "creditor";
  createdById: string;
  debtorId?: string;
  debtorName?: string;
  creditorId?: string;
  creditorName?: string;
  debtor?: { id: string; name: string; email: string };
  creditor?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  receipt?: string;
  notes?: string;
  paidAt: string;
  paidBy: { id: string; name: string };
}

export interface DebtDetail extends Debt {
  payments: Payment[];
}

interface CreateDebtInput {
  title: string;
  description?: string;
  totalAmount: number;
  userRole: "debtor" | "creditor";
  otherPartyEmail?: string;
  otherPartyName?: string;
}

interface UpdateDebtInput {
  title?: string;
  description?: string;
  totalAmount?: number;
}

export function useDebts() {
  return useQuery<Debt[]>({
    queryKey: ["debts"],
    queryFn: async () => {
      const res = await api.get("/debts");
      return res.data;
    },
  });
}

export function usePaidDebts() {
  return useQuery<Debt[]>({
    queryKey: ["debts", "paid"],
    queryFn: async () => {
      const res = await api.get("/debts/paid");
      return res.data;
    },
  });
}

export function useDebt(id: string) {
  return useQuery<DebtDetail>({
    queryKey: ["debts", id],
    queryFn: async () => {
      const res = await api.get(`/debts/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDebtInput) => {
      const res = await api.post("/debts", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDebtInput }) => {
      const res = await api.patch(`/debts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useCancelDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "ACTIVE" | "CANCELLED" }) => {
      const res = await api.patch(`/debts/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/debts/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}
