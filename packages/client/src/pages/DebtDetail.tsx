import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useDebt, useCancelDebt, useDeleteDebt } from "../hooks/useDebts";
import { useAuth } from "../context/AuthContext";
import { PaymentModal } from "../components/debts/PaymentModal";
import { EditDebtModal } from "../components/debts/EditDebtModal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useToast } from "../context/ToastContext";

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

export default function DebtDetail() {
  const { debtId } = useParams({ from: "/debts/$debtId" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: debt, isLoading } = useDebt(debtId);
  const cancelDebt = useCancelDebt();
  const deleteDebt = useDeleteDebt();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!debt) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
        Deuda no encontrada
      </div>
    );
  }

  const canEdit = user?.id === debt.createdById;
  const progress = debt.totalAmount > 0 ? Math.min((debt.paidAmount / debt.totalAmount) * 100, 100) : 0;
  const remaining = Math.max(debt.totalAmount - debt.paidAmount, 0);
  const isComplete = remaining <= 0;
  const isActive = debt.status === "ACTIVE";
  const otherPartyName = debt.role === "debtor"
    ? (debt.creditor?.name || debt.creditorName || "Desconocido")
    : (debt.debtor?.name || debt.debtorName || "Desconocido");

  const handleCancel = async () => {
    await cancelDebt.mutateAsync({ id: debtId, status: "CANCELLED" });
    setConfirmCancel(false);
    addToast("Deuda cancelada", "success");
  };

  const handleDelete = async () => {
    await deleteDebt.mutateAsync(debtId);
    setConfirmDelete(false);
    addToast("Deuda eliminada", "success");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{debt.title}</h1>
            {debt.description && (
              <p className="text-gray-600 mt-2">{debt.description}</p>
            )}
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusColors[debt.status]}`}>
            {statusLabels[debt.status]}
          </span>
        </div>

        <p className="text-gray-700 mb-4">
          <span className="font-medium">Contraparte:</span> {otherPartyName}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">
              ${debt.paidAmount.toFixed(2)} / ${debt.totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                isComplete ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <p className="text-lg font-semibold text-gray-900 mb-4">
          {isComplete
            ? "Completamente pagado"
            : `Falta $${remaining.toFixed(2)}`}
        </p>

        <div className="flex gap-3">
          {isActive && (
            <button
              type="button"
              onClick={() => setIsPaymentOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Registrar pago
            </button>
          )}
          {canEdit && isActive && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium"
            >
              Editar
            </button>
          )}
          {canEdit && isActive && (
            <button
              type="button"
              onClick={() => setConfirmCancel(true)}
              className="bg-white border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 font-medium"
            >
              Cancelar
            </button>
          )}
          {canEdit && debt.status === "CANCELLED" && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="bg-white border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Pagos realizados ({debt.payments.length})
        </h2>

        {debt.payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay pagos registrados todav&iacute;a.
          </p>
        ) : (
          <div className="space-y-3">
            {debt.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(payment.paidAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{payment.paidBy.name}</p>
                  {payment.receipt && (
                    <a
                      href={payment.receipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver comprobante
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {debt && (
        <EditDebtModal
          isOpen={isEditing}
          debt={debt}
          onClose={() => setIsEditing(false)}
        />
      )}
      <PaymentModal
        debtId={debtId}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
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
    </div>
  );
}
