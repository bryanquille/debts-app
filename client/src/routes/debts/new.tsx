// routes/debts/new.tsx — Página para crear una nueva deuda

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { sileo } from "sileo";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const createDebtSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  description: z.string().optional(),
  debtorName: z.string().min(1, "Nombre del deudor requerido"),
  dueDate: z.string().optional(),
});

export const Route = createFileRoute("/debts/new")({
  component: NewDebtPage,
});

function NewDebtPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createDebtSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      debtorName: "",
      dueDate: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post("/debts", data);
      sileo.success({ title: "Deuda creada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      router.navigate({ to: "/debts" });
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Error al crear deuda",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nueva Deuda</h1>
        <p className="text-gray-500 dark:text-gray-400">Registra una nueva deuda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <Input
          id="amount"
          label="Monto"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />
        <Input
          id="debtorName"
          label="Deudor"
          placeholder="Nombre de la persona"
          error={errors.debtorName?.message}
          {...register("debtorName")}
        />
        <Input
          id="description"
          label="Descripción (opcional)"
          placeholder="Ej: Préstamo para el auto"
          error={errors.description?.message}
          {...register("description")}
        />
        <Input
          id="dueDate"
          label="Fecha límite (opcional)"
          type="date"
          error={errors.dueDate?.message}
          {...register("dueDate")}
        />
        <div className="flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => router.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">
            Crear Deuda
          </Button>
        </div>
      </form>
    </div>
  );
}