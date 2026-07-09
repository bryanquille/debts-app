import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { PaymentForm } from "@/features/payments/paymentForm";
import api from "@/lib/axios";
import type { Debt } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Banknote, Plus, CheckCircle2 } from "lucide-react";
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

  const { data: debt, isLoading } = useQuery({
    queryKey: ["debt", id],
    queryFn: () => api.get<Debt>(`/debts/${id}`).then((r) => r.data),
  });

  const handleSettle = async () => {
    try {
      await api.post(`/debts/${id}/settle`);
      sileo.success({ title: "Deuda liquidada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.navigate({ to: "/debts/settled" });
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Error al liquidar",
      });
    }
  };

  const handleRequestLiquidation = async () => {
    try {
      await api.post(`/debts/${id}/request-liquidation`);
      sileo.success({ title: "Solicitud de liquidación enviada" });
      queryClient.invalidateQueries({ queryKey: ["debt", id] });
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Error al solicitar liquidación",
      });
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
  const remaining = Number(debt.amount) - Number(debt.paidAmount);
  const canRequestLiquidation =
    isDebtor &&
    debt.status === "ACTIVE" &&
    Number(debt.paidAmount) >= Number(debt.amount);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button
        onClick={() => router.history.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      {/* Resumen de la deuda */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              {debt.description || "Deuda sin descripción"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isCreditor ? "Acreedor" : "Deudor"} ·{" "}
              {isCreditor
                ? debt.debtor?.name || debt.debtorName
                : debt.creditor.name}
            </p>
          </div>
          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-medium ${
              debt.status === "ACTIVE"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : debt.status === "PENDING_LIQUIDATION"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : debt.status === "SETTLED"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            {debt.status === "ACTIVE"
              ? "Activa"
              : debt.status === "PENDING_LIQUIDATION"
                ? "Pendiente de liquidación"
                : debt.status === "SETTLED"
                  ? "Liquidada"
                  : "Cancelada"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t pt-6 dark:border-gray-700 sm:gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Monto total</p>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100 sm:text-xl">
              {formatCurrency(debt.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Pagado</p>
            <p className="text-base font-bold text-green-600 dark:text-green-400 sm:text-xl">
              {formatCurrency(debt.paidAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">Restante</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400 sm:text-xl">
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>

        {/* Botones de acción del resumen */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {(debt.status === "ACTIVE" || debt.status === "PENDING_LIQUIDATION") && (
            <Button
              onClick={() => setPaymentModalOpen(true)}
              className="flex-1"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar Pago
            </Button>
          )}

          {canRequestLiquidation && (
            <Button
              variant="secondary"
              onClick={handleRequestLiquidation}
              className="flex-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Solicitar Liquidación
            </Button>
          )}
        </div>
      </div>

      {/* Historial de pagos */}
      <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Historial de Pagos
        </h2>

        {!debt.payments || debt.payments.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay pagos registrados aún
          </p>
        ) : (
          <div className="space-y-3">
            {debt.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-2 rounded-lg border p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Pagado por {payment.user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(payment.createdAt)}
                    </p>
                    {payment.note && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{payment.note}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </p>
                  {payment.imageUrl && (
                    <a
                      href={payment.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400"
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

      {/* Alertas de acción */}
      {debt.status === "PENDING_LIQUIDATION" && isCreditor && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-900/30">
          <p className="mb-3 text-sm text-yellow-800 dark:text-yellow-200">
            El deudor ha solicitado la liquidación de esta deuda. Revisa los
            pagos y confirma si todo está en orden antes de liquidar.
          </p>
          <Button onClick={handleSettle}>Liquidar Deuda</Button>
        </div>
      )}

      {/* Modal de registro de pago */}
      <Modal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Registrar Pago"
      >
        <PaymentForm
          debtId={id}
          onSuccess={() => setPaymentModalOpen(false)}
        />
      </Modal>
    </div>
  );
}