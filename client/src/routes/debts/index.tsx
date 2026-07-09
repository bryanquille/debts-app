import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import api from "@/lib/axios";
import type { Debt } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PlusCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/debts/")({
  component: DebtsPage,
});

function DebtsPage() {
  const router = useRouter();

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts", "active"],
    queryFn: () => api.get<Debt[]>("/debts?status=ACTIVE").then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mis Deudas</h1>
          <p className="text-gray-500 dark:text-gray-400">Deudas activas registradas</p>
        </div>
        <Button onClick={() => router.navigate({ to: "/debts/new" })} className="self-start sm:self-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nueva Deuda
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {debts?.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No tienes deudas activas</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.navigate({ to: "/debts/new" })}
          >
            Crear primera deuda
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {debts?.map((debt) => (
          <button
            key={debt.id}
            onClick={() => router.navigate({ to: "/debts/$id", params: { id: debt.id } })}
            className="w-full rounded-xl border bg-white p-4 text-left transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                  {debt.description || "Deuda sin descripción"}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {debt.debtor?.name || debt.debtorName || "Deudor no especificado"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {formatCurrency(debt.amount)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pagado: {formatCurrency(debt.paidAmount)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}