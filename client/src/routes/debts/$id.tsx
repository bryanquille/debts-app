import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { PaymentForm } from "@/features/payments/paymentForm";
import api from "@/lib/axios";
import type { Debt } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Banknote, Plus, CheckCircle2, Edit3, Trash2, XCircle } from "lucide-react";
import { sileo } from "sileo";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";

export const Route = createFileRoute("/debts/$id")({
  component: DebtDetailPage,
});

function DebtDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: debt, isLoading } = useQuery({
    queryKey: ["debt", id],
    queryFn: () => api.get<Debt>(`/debts/${id}`).then((r) => r.data),
  });

  const { data: deletionStatus } = useQuery({
    queryKey: ["debt", id, "deletion-status"],
    queryFn: () => api.get(`/debts/${id}/deletion-status`).then((r) => r.data),
    enabled: !!debt && debt.status !== "CANCELLED",
  });

  const handleSettle = async () => {
    try {
      await api.post(`/debts/${id}/settle`);
      sileo.success({ title: "Deuda liquidada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.navigate({ to: "/debts/settled" });
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error al liquidar" });
    }
  };

  const handleRequestLiquidation = async () => {
    try {
      await api.post(`/debts/${id}/request-liquidation`);
      sileo.success({ title: "Solicitud de liquidacion enviada" });
      queryClient.invalidateQueries({ queryKey: ["debt", id] });
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error al solicitar liquidacion" });
    }
  };

  const handleRequestDeletion = async () => {
    try {
      await api.post(`/debts/${id}/request-deletion`);
      sileo.success({ title: "Solicitud de eliminacion enviada" });
      queryClient.invalidateQueries({ queryKey: ["debt", id] });
      setDeleteModalOpen(false);
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error al solicitar eliminacion" });
    }
  };

  const handleApproveDeletion = async () => {
    try {
      await api.post(`/debts/${id}/approve-deletion`);
      sileo.success({ title: "Eliminacion aprobada, deuda cancelada" });
      queryClient.invalidateQueries({ queryKey: ["debt", id] });
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error" });
    }
  };

  const handleRejectDeletion = async () => {
    try {
      const res = await api.post(`/debts/${id}/reject-deletion`);
      sileo.info({ title: "Solicitud rechazada", description: res.data.message });
      queryClient.invalidateQueries({ queryKey: ["debt", id] });
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!debt) {
    return <p className="text-gray-500 dark:text-gray-400">Deuda no encontrada</p>;
  }

  const isCreditor = debt.creditorId === user?.id;
  const isDebtor = debt.debtorId === user?.id;
  const isInvolved = isCreditor || isDebtor;
  const remaining = Number(debt.amount) - Number(debt.paidAmount);
  const canRequestLiquidation = isDebtor && debt.status === "ACTIVE" && Number(debt.paidAmount) >= Number(debt.amount);
  const canRegisterPayment = isDebtor || (isCreditor && debt.debtorId === null);
  const pendingDeletionFromMe = debt.deletionRequestedBy === user?.id;
  const pendingDeletionForMe = debt.deletionRequestedBy && debt.deletionRequestedBy !== user?.id;
  const canEdit = isCreditor && debt.status === "ACTIVE";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.history.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              {debt.description || "Deuda sin descripcion"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isCreditor ? "Acreedor" : isDebtor ? "Deudor" : "Involucrado"} &middot;{" "}
              {isCreditor
                ? (debt.debtor?.name || debt.debtorName || "Deudor no especificado")
                : (debt.creditor.name || debt.creditorName || "Acreedor no especificado")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={() => setEditModalOpen(true)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700 dark:hover:text-blue-400 cursor-pointer"
                title="Editar deuda"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {isInvolved && debt.status !== "CANCELLED" && debt.status !== "SETTLED" && !pendingDeletionFromMe && !pendingDeletionForMe && (
              <button onClick={() => setDeleteModalOpen(true)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-400 cursor-pointer"
                title="Solicitar eliminacion"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
              debt.status === "ACTIVE"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : debt.status === "PENDING_LIQUIDATION"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : debt.status === "SETTLED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}>
              {debt.status === "ACTIVE" ? "Activa"
                : debt.status === "PENDING_LIQUIDATION" ? "Pendiente de liquidacion"
                : debt.status === "SETTLED" ? "Liquidada" : "Cancelada"}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-6 dark:border-gray-700 sm:gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Monto total</p>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 sm:text-xl">{formatCurrency(debt.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Pagado</p>
            <p className="text-base font-bold text-green-600 dark:text-green-400 sm:text-xl">{formatCurrency(debt.paidAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Restante</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400 sm:text-xl">{formatCurrency(remaining)}</p>
          </div>
        </div>

        {debt.dueDate && (
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Fecha limite: {formatDate(debt.dueDate)}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {(debt.status === "ACTIVE" || debt.status === "PENDING_LIQUIDATION") && canRegisterPayment && (
            <Button onClick={() => setPaymentModalOpen(true)} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          )}
          {canRequestLiquidation && (
            <Button variant="secondary" onClick={handleRequestLiquidation} className="flex-1">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Solicitar Liquidacion
            </Button>
          )}
        </div>

        {pendingDeletionFromMe && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200">
            Has solicitado la eliminacion de esta deuda. Esperando respuesta de la otra parte.
          </div>
        )}

        {pendingDeletionForMe && (
          <div className="mt-4 space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/30">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              La otra parte solicita eliminar esta deuda
            </p>
            <div className="flex gap-3">
              <Button variant="danger" size="sm" onClick={handleRejectDeletion}>
                <XCircle className="mr-1 h-4 w-4" />
                Rechazar
              </Button>
              <Button size="sm" onClick={handleApproveDeletion}>
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Aprobar y eliminar
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Historial de Pagos</h2>
        {!debt.payments || debt.payments.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">No hay pagos registrados aun</p>
        ) : (
          <div className="space-y-3">
            {debt.payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-2 rounded-lg border p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Pagado por {payment.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {payment.paymentDate ? formatDate(payment.paymentDate) : formatDate(payment.createdAt)}
                    </p>
                    {payment.note && <p className="text-xs text-gray-400 dark:text-gray-500">{payment.note}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-bold text-green-600 dark:text-green-400">{formatCurrency(payment.amount)}</p>
                  {payment.imageUrl && (
                    <a href={payment.imageUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400">Ver comprobante</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {debt.status === "PENDING_LIQUIDATION" && isCreditor && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/30">
          <p className="mb-3 text-sm text-yellow-800 dark:text-yellow-200">
            El deudor ha solicitado la liquidacion de esta deuda. Revisa los pagos y confirma si todo esta en orden antes de liquidar.
          </p>
          <Button onClick={handleSettle}>Liquidar Deuda</Button>
        </div>
      )}

      <Modal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Registrar Pago">
        <PaymentForm debtId={id} onSuccess={() => setPaymentModalOpen(false)} />
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Deuda">
        <EditDebtForm debt={debt} onSuccess={() => { setEditModalOpen(false); queryClient.invalidateQueries({ queryKey: ["debt", id] }); }} />
      </Modal>

      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Solicitar Eliminacion">
        <DeleteDebtForm onConfirm={handleRequestDeletion} onCancel={() => setDeleteModalOpen(false)} />
      </Modal>
    </div>
  );
}

function EditDebtForm({ debt, onSuccess }: { debt: Debt; onSuccess: () => void }) {
  const [amount, setAmount] = useState(String(debt.amount));
  const [description, setDescription] = useState(debt.description || "");
  const [dueDate, setDueDate] = useState(debt.dueDate ? debt.dueDate.split("T")[0] : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/debts/${debt.id}`, {
        amount: Number(amount),
        description: description || undefined,
        dueDate: dueDate || undefined,
      });
      sileo.success({ title: "Deuda actualizada" });
      onSuccess();
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error al editar" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monto</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripcion</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha limite</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </div>
      <div className="flex gap-3">
        <Button type="submit" loading={loading} className="flex-1">Guardar Cambios</Button>
      </div>
    </form>
  );
}

function DeleteDebtForm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Se notificara a la otra parte sobre tu solicitud de eliminacion. Ambos deben aprobar para que la deuda sea eliminada definitivamente.
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1">Solicitar Eliminacion</Button>
      </div>
    </div>
  );
}
