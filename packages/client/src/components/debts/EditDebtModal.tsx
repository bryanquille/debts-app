import { useState } from "react";
import { useUpdateDebt } from "../../hooks/useDebts";

interface EditDebtModalProps {
  isOpen: boolean;
  debt: {
    id: string;
    title: string;
    description?: string;
    totalAmount: number;
  };
  onClose: () => void;
}

export function EditDebtModal({ isOpen, debt, onClose }: EditDebtModalProps) {
  const [title, setTitle] = useState(debt.title);
  const [description, setDescription] = useState(debt.description || "");
  const [totalAmount, setTotalAmount] = useState(debt.totalAmount.toString());
  const updateDebt = useUpdateDebt();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalAmount) return;

    const data: Record<string, string | number | undefined> = {};
    if (title !== debt.title) data.title = title;
    if (description !== (debt.description || "")) data.description = description || undefined;
    const parsedAmount = parseFloat(totalAmount);
    if (parsedAmount !== debt.totalAmount) data.totalAmount = parsedAmount;

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

    await updateDebt.mutateAsync({ id: debt.id, data });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Editar deuda</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              T&iacute;tulo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripci&oacute;n (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto total
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={updateDebt.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {updateDebt.isPending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
