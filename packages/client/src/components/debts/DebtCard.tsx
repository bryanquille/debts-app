import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";
import { useCancelDebt, useDeleteDebt, type Debt } from "../../hooks/useDebts";
import { EditDebtModal } from "./EditDebtModal";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useToast } from "../../context/ToastContext";

interface DebtCardProps {
  debt: Debt;
  onPay?: (debtId: string) => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "Activa",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

export function DebtCard({ debt, onPay }: DebtCardProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const cancelDebt = useCancelDebt();
  const deleteDebt = useDeleteDebt();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEdit = user?.id === debt.createdById;
  const progress = debt.totalAmount > 0 ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100) : 0;
  const remaining = Math.max(debt.totalAmount - debt.paidAmount, 0);

  const otherPartyName = debt.role === "debtor"
    ? (debt.creditor?.name || debt.creditorName || "Desconocido")
    : (debt.debtor?.name || debt.debtorName || "Desconocido");

  const roleLabel = debt.role === "debtor" ? "Le debo a" : "Me debe";
  const isComplete = remaining <= 0;
  const isActive = debt.status === "ACTIVE";

  const handleCancel = async () => {
    await cancelDebt.mutateAsync({ id: debt.id, status: "CANCELLED" });
    setConfirmCancel(false);
    addToast("Deuda cancelada", "success");
  };

  const handleDelete = async () => {
    await deleteDebt.mutateAsync(debt.id);
    setConfirmDelete(false);
    addToast("Deuda eliminada", "success");
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{debt.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {roleLabel}: <span className="font-medium text-gray-700">{otherPartyName}</span>
            </p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[debt.status] || "bg-gray-100 text-gray-700"}`}>
            {statusLabels[debt.status] || debt.status}
          </span>
        </div>

        {isActive && (
          <>
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pagado</span>
                <span className="font-medium">
                  ${debt.paidAmount.toFixed(2)} / ${debt.totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isComplete ? "bg-green-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {isComplete ? "Completamente pagado" : `Falta $${remaining.toFixed(2)}`}
            </p>
          </>
        )}

        <div className="flex gap-2">
          <Link
            to="/debts/$debtId"
            params={{ debtId: debt.id }}
            className="flex-1 text-center text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
          >
            Ver detalle
          </Link>
          {onPay && isActive && (
            <button
              type="button"
              onClick={() => onPay(debt.id)}
              className="flex-1 text-sm bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Pagar
            </button>
          )}
          {canEdit && isActive && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-sm bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50"
            >
              Editar
            </button>
          )}
          {canEdit && isActive && (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="text-sm bg-white border border-red-300 text-red-600 py-2 px-3 rounded-lg hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
          {canEdit && debt.status === "CANCELLED" && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-sm bg-white border border-red-300 text-red-600 py-2 px-3 rounded-lg hover:bg-red-50"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {canEdit && (
        <EditDebtModal
          isOpen={isEditing}
          debt={debt}
          onClose={() => setIsEditing(false)}
        />
      )}
      <ConfirmDialog
        isOpen={confirmCancel}
        title="Cancelar deuda"
        message="¿Estás seguro de cancelar esta deuda? Esta acción no se puede deshacer."
        confirmLabel="Cancelar deuda"
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
      <ConfirmDialog
        isOpen={confirmDelete}
        title="Eliminar deuda"
        message="¿Estás seguro de eliminar esta deuda? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
