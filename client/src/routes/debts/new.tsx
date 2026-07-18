import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { UserSearch } from "@/components/ui/userSearch";
import { sileo } from "sileo";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { User } from "@/types";

const createDebtSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export const Route = createFileRoute("/debts/new")({
  component: NewDebtPage,
});

function NewDebtPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<"creditor" | "debtor">("creditor");
  const [counterparty, setCounterparty] = useState<User | null>(null);
  const [counterpartyName, setCounterpartyName] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createDebtSchema),
    defaultValues: { amount: undefined, description: "", dueDate: "" },
  });

  const onSubmit = async (data: any) => {
    if (!counterparty && !counterpartyName) {
      sileo.error({
        title: "Error",
        description: role === "creditor" ? "Debes especificar el deudor" : "Debes especificar el acreedor",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: any = {
        amount: Number(data.amount),
        description: data.description || undefined,
        dueDate: data.dueDate || undefined,
        role,
      };
      if (counterparty) {
        payload.counterpartyId = counterparty.id;
      } else {
        payload.counterpartyName = counterpartyName;
      }
      await api.post("/debts", payload);
      sileo.success({ title: "Deuda creada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.navigate({ to: "/debts" });
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error al crear deuda" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nueva Deuda</h1>
        <p className="text-gray-600 dark:text-gray-400">Registra una nueva deuda</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-gray-300 bg-white p-6 shadow-md dark:border-gray-600 dark:bg-gray-800">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">Que estas haciendo?</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setRole("creditor")}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                role === "creditor"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Estoy prestando dinero
              <span className="block text-xs font-normal mt-0.5">Soy el acreedor</span>
            </button>
            <button type="button" onClick={() => setRole("debtor")}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                role === "debtor"
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Estoy pidiendo prestado
              <span className="block text-xs font-normal mt-0.5">Soy el deudor</span>
            </button>
          </div>
        </div>

        <UserSearch
          label={role === "creditor" ? "Deudor (buscar usuario registrado)" : "Acreedor (buscar usuario registrado)"}
          onSelect={(user) => {
            setCounterparty(user);
            if (user) setCounterpartyName("");
          }}
          placeholder="Buscar por nombre o email..."
        />

        <Input
          id="counterpartyName"
          label={role === "creditor" ? "O escribe el nombre del deudor" : "O escribe el nombre del acreedor"}
          placeholder="Nombre de la persona"
          value={counterparty ? "" : counterpartyName}
          onChange={(e) => {
            setCounterpartyName(e.target.value);
            if (e.target.value) setCounterparty(null);
          }}
        />

        <Input id="amount" label="Monto" type="number" step="0.01" placeholder="0.00" error={errors.amount?.message} {...register("amount")} />
        <Input id="description" label="Descripcion (opcional)" placeholder="Ej: Prestamo para el auto" error={errors.description?.message} {...register("description")} />
        <Input id="dueDate" label="Fecha limite (opcional)" type="date" error={errors.dueDate?.message} {...register("dueDate")} />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => router.history.back()}>Cancelar</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">Crear Deuda</Button>
        </div>
      </form>
    </div>
  );
}
