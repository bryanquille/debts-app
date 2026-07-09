// routes/profile.tsx — Página de perfil del usuario

import { createFileRoute } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/lib/utils";
import { User, Mail, Calendar } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">Información de tu cuenta</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Correo electrónico</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
          <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Miembro desde</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Fecha de registro
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}