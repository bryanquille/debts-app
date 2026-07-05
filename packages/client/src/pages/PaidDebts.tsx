import { useState } from "react";
import { usePaidDebts } from "../hooks/useDebts";
import { DebtCard } from "../components/debts/DebtCard";

export default function PaidDebts() {
  const [tab, setTab] = useState<"debtor" | "creditor">("debtor");
  const { data: debts = [], isLoading } = usePaidDebts();

  const filteredDebts = debts.filter((d) => d.role === tab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Deudas liquidadas</h1>

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setTab("debtor")}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            tab === "debtor"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pagué ({debts.filter((d) => d.role === "debtor").length})
        </button>
        <button
          onClick={() => setTab("creditor")}
          className={`flex-1 py-2 text-sm font-medium rounded-md ${
            tab === "creditor"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Cobré ({debts.filter((d) => d.role === "creditor").length})
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500 text-center py-20">Cargando...</p>
      ) : filteredDebts.length === 0 ? (
        <p className="text-gray-500 text-center py-20">
          No hay deudas liquidadas en esta categoría.
        </p>
      ) : (
        <div className="grid gap-4">
          {filteredDebts.map((debt) => (
            <DebtCard key={debt.id} debt={debt} />
          ))}
        </div>
      )}
    </div>
  );
}
