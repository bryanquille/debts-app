import axios from "axios";
import { useState, useRef } from "react";
import { useCreatePayment } from "../../hooks/usePayments";
import { useToast } from "../../context/ToastContext";

interface PaymentModalProps {
  debtId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ debtId, isOpen, onClose }: PaymentModalProps) {
  const { addToast } = useToast();
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const createPayment = useCreatePayment();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const formData = new FormData();
    formData.append("amount", amount);
    if (notes) formData.append("notes", notes);
    if (file) formData.append("receipt", file);

    try {
      await createPayment.mutateAsync({ debtId, data: formData });
      setAmount("");
      setNotes("");
      setFile(null);
      setPreview(null);
      addToast("Pago registrado exitosamente", "success");
      onClose();
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message || "Error al registrar el pago" : "Error al registrar el pago";
      addToast(message, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Registrar pago</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ?
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej: Pago de la semana..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comprobante (opcional)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {preview && (
              <div className="mt-2 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-48 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={createPayment.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {createPayment.isPending ? "Registrando..." : "Registrar pago"}
          </button>

        </form>
      </div>
    </div>
  );
}
