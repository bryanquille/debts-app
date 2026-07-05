import { useState } from "react";
import { useDebts } from "../hooks/useDebts";
import { DebtCard } from "../components/debts/DebtCard";
import { NewDebtModal } from "../components/debts/NewDebtModal";
import { PaymentModal } from "../components/debts/PaymentModal";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState<"debtor" | "creditor">("debtor");
  const [isNewDebtOpen, setIsNewDebtOpen] = useState(false);
  const [payingDebtId, setPayingDebtId] = useState<string | null>(null);
  const { data: debts = [], isLoading } = useDebts();

  const filteredDebts = debts.filter((d) => d.role === tab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsNewDebtOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Nueva deuda
        </button>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setTab("debtor")}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            tab === "debtor"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Debo ({debts.filter((d) => d.role === "debtor").length})
        </button>
        <button
          onClick={() => setTab("creditor")}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            tab === "creditor"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Me deben ({debts.filter((d) => d.role === "creditor").length})
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredDebts.length === 0 ? (
        <p className="text-gray-500 text-center py-20">
          {tab === "debtor"
            ? "No tienes deudas activas. ¡Crea una nueva!"
            : "No te deben dinero actualmente."}
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} onPay={setPayingDebtId} />
          ))}
        </div>
      )}

      <NewDebtModal isOpen={isNewDebtOpen} onClose={() => setIsNewDebtOpen(false)} />
      {payingDebtId && (
        <PaymentModal
          debtId={payingDebtId}
          isOpen={!!payingDebtId}
          onClose={() => setPayingDebtId(null)}
        />
      )}
    </div>
  );
}
