import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { sileo } from "sileo";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";

const paymentSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  note: z.string().optional(),
  paymentDate: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  debtId: string;
  onSuccess: () => void;
}

export function PaymentForm({ debtId, onSuccess }: PaymentFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { paymentDate: today },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        amount: data.amount,
        note: data.note || undefined,
        paymentDate: data.paymentDate || today,
      };
      await api.post(`/debts/${debtId}/payments`, payload);
      sileo.success({ title: "Pago registrado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["debt", debtId] });
      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (err: any) {
      sileo.error({ title: "Error", description: err.response?.data?.error || "Error al registrar pago" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input id="payment-amount" label="Monto del pago" type="number" step="0.01" placeholder="0.00" error={errors.amount?.message} {...register("amount")} />

      <Input id="payment-date" label="Fecha del pago" type="date" error={errors.paymentDate?.message} {...register("paymentDate")} />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nota (opcional)</label>
        <textarea {...register("note")} rows={3}
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
          placeholder="Ej: Pago correspondiente a..." />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comprobante (opcional)</label>
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-400 dark:hover:text-blue-400">
          <Upload className="h-5 w-5" />
          <span>{selectedFile ? selectedFile.name : "Subir imagen (voucher, foto, etc.)"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
        </label>
        <p className="text-xs text-gray-400 dark:text-gray-500">Aun no configurado -- se integrara con Uploadthing proximamente</p>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full">Registrar Pago</Button>
    </form>
  );
}
