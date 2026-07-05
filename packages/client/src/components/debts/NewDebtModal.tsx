import axios from "axios";
import { useState } from "react";
import { UserSearch } from "./UserSearch";
import { useCreateDebt } from "../../hooks/useDebts";
import { useToast } from "../../context/ToastContext";

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewDebtModal({ isOpen, onClose }: NewDebtModalProps) {
  const { addToast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [userRole, setUserRole] = useState<"debtor" | "creditor">("debtor");
  const [otherParty, setOtherParty] = useState<{ id?: string; name: string }>({ name: "" });
  const createDebt = useCreateDebt();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !totalAmount || !otherParty.name) return;

    const data = {
      title,
      description: description || undefined,
      totalAmount: parseFloat(totalAmount),
      userRole,
      ...(otherParty.id
        ? { otherPartyEmail: otherParty.id }
        : { otherPartyName: otherParty.name }),
    };

    try {
      await createDebt.mutateAsync(data);
      setTitle("");
      setDescription("");
      setTotalAmount("");
      setUserRole("debtor");
      setOtherParty({ name: "" });
      addToast("Deuda creada exitosamente", "success");
      onClose();
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message || "Error al crear la deuda" : "Error al crear la deuda";
      addToast(message, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Nueva deuda</h2>
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
              T�tulo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Pr�stamo para el auto"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripci�n (opcional)
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
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yo soy el...
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserRole("debtor")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                  userRole === "debtor"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Deudor
              </button>
              <button
                type="button"
                onClick={() => setUserRole("creditor")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                  userRole === "creditor"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Acreedor
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userRole === "debtor"
                ? "Le debes dinero a alguien"
                : "Alguien te debe dinero a ti"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {userRole === "debtor" ? "Acreedor" : "Deudor"}
            </label>
            <UserSearch
              value={otherParty}
              onChange={setOtherParty}
              placeholder={userRole === "debtor" ? "Buscar acreedor..." : "Buscar deudor..."}
            />
          </div>

          <button
            type="submit"
            disabled={createDebt.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {createDebt.isPending ? "Creando..." : "Crear deuda"}
          </button>

        </form>
      </div>
    </div>
  );
}
