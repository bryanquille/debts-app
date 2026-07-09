// routes/debts/settled.tsx — Listado de deudas liquidadas

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Debt } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/debts/settled")({
  component: SettledDebtsPage,
});

function SettledDebtsPage() {
  const router = useRouter();

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts", "settled"],
    queryFn: () => api.get<Debt[]>("/debts?status=SETTLED").then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deudas Liquidadas</h1>
        <p className="text-gray-500 dark:text-gray-400">Historial de deudas que ya fueron saldadas</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {debts?.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">No hay deudas liquidadas aún</p>
        </div>
      )}

      <div className="space-y-3">
        {debts?.map((debt) => (
          <button
            key={debt.id}
            onClick={() =>
              router.navigate({ to: "/debts/$id", params: { id: debt.id } })
            }
            className="w-full rounded-xl border bg-white p-4 text-left transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {debt.description || "Deuda sin descripción"}
                  </p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {debt.debtor?.name || debt.debtorName}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(debt.amount)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Liquidada el {formatDate(debt.updatedAt)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}