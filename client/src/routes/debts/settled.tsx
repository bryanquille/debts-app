import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Debt } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";

type Tab = "creditor" | "debtor";

export const Route = createFileRoute("/debts/settled")({
  component: SettledDebtsPage,
});

function SettledDebtsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("creditor");

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts", "settled", tab],
    queryFn: () => api.get<Debt[]>(`/debts?status=SETTLED&role=${tab}`).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.navigate({ to: "/debts" })}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Deudas Liquidadas</h1>
          <p className="text-gray-500 dark:text-gray-400">Historial de deudas que ya fueron saldadas</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button onClick={() => setTab("creditor")}
          className={`flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            tab === "creditor"
              ? "bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          Me pagaron
        </button>
        <button onClick={() => setTab("debtor")}
          className={`flex flex-1 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
            tab === "debtor"
              ? "bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-400"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          }`}
        >
          Pague
        </button>
      </div>

      {isLoading && <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>}
      {debts?.length === 0 && (
        <div className="rounded-xl border-2 border-dashed bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">{tab === "creditor" ? "No te han pagado deudas aun" : "No has pagado deudas aun"}</p>
        </div>
      )}
      <div className="space-y-3">
        {debts?.map((debt) => (
          <button key={debt.id} onClick={() => router.navigate({ to: "/debts/$id", params: { id: debt.id } })}
            className="w-full rounded-xl border bg-white p-4 text-left transition-all hover:border-blue-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">{debt.description || "Deuda sin descripcion"}</p>
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {tab === "creditor"
                      ? (debt.debtor?.name || debt.debtorName || "Deudor")
                      : (debt.creditor.name || debt.creditorName || "Acreedor")}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(debt.amount)}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Liquidada el {formatDate(debt.updatedAt)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
