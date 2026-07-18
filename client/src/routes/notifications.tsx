import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Notification } from "@/types";
import { Bell, ArrowLeft, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui";
import { sileo } from "sileo";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get<Notification[]>("/notifications").then((r) => r.data),
    refetchInterval: 30000,
  });

  const handleClick = async (n: Notification) => {
    if (!n.read) {
      try {
        await api.put(`/notifications/${n.id}/read`);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      } catch {}
    }
    if (n.debtId) {
      router.navigate({ to: "/debts/$id", params: { id: n.debtId } });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      sileo.success({ title: "Todas marcadas como leidas" });
    } catch {
      sileo.error({ title: "Error al marcar notificaciones" });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.history.back()}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notificaciones</h1>
            <p className="text-gray-600 dark:text-gray-400">Historial de notificaciones</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck className="mr-1 h-4 w-4" />
          Marcar todas leidas
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {notifications?.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
          <Bell className="mx-auto h-12 w-12 text-gray-500 dark:text-gray-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">No tienes notificaciones</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications?.map((n) => (
          <button key={n.id} onClick={() => handleClick(n)}
            className={`w-full rounded-xl border border-gray-300 bg-white p-4 text-left shadow-md transition-all hover:border-blue-400 hover:-translate-y-0.5 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-500 cursor-pointer ${
              n.read ? "" : "border-l-4 border-l-blue-500"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${n.read ? "text-gray-800 dark:text-gray-300" : "text-gray-900 dark:text-gray-100"}`}>
                  {n.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
              {n.type === "DELETION_REQUEST" && n.debtId && (
                <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  Accion requerida
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
