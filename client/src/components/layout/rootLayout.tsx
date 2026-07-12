import { useState } from "react";
import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import { ThemeToggle } from "@/components/ui/themeToggle";
import {
  LogOut, ClipboardList, PlusCircle, CheckCircle2, User, Menu, X, Bell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Notification } from "@/types";

const navItems = [
  { href: "/debts", label: "Mis Deudas", icon: ClipboardList },
  { href: "/debts/new", label: "Nueva Deuda", icon: PlusCircle },
  { href: "/debts/settled", label: "Liquidadas", icon: CheckCircle2 },
  { href: "/profile", label: "Perfil", icon: User },
];

function NotificationBell({ dropdownAlign = "right" }: { dropdownAlign?: "left" | "right" }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/notifications/unread-count").then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => api.get<Notification[]>("/notifications").then((r) => r.data),
    refetchInterval: 30000,
    enabled: dropdownOpen,
  });

  const unreadCount = unreadData?.count ?? 0;
  const recent = (notifications ?? []).slice(0, 5);

  const handleClick = (notif: Notification) => {
    setDropdownOpen(false);
    if (!notif.read) {
      api.put(`/notifications/${notif.id}/read`).catch(() => {});
    }
    if (notif.debtId) {
      router.navigate({ to: "/debts/$id", params: { id: notif.debtId } });
    } else {
      router.navigate({ to: "/notifications" });
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className={`absolute z-50 mt-2 w-80 max-w-[calc(100vw-1rem)] rounded-xl border bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 ${dropdownAlign === "left" ? "left-0" : "right-0"}`}>
            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
              <button onClick={() => { api.put("/notifications/read-all").catch(() => {}); }}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
              >
                Marcar todas leídas
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">Sin notificaciones</p>
              ) : (
                recent.map((n) => (
                  <button key={n.id} onClick={() => handleClick(n)}
                    className={`w-full border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 cursor-pointer ${n.read ? "" : "bg-blue-50 dark:bg-blue-900/20"}`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                    </p>
                  </button>
                ))
              )}
            </div>
            <div className="border-t px-4 py-2 dark:border-gray-700">
              <button onClick={() => { setDropdownOpen(false); router.navigate({ to: "/notifications" }); }}
                className="w-full text-center text-xs text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
              >
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function RootLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    logout();
    router.navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className="hidden w-64 flex-col border-r bg-white dark:border-gray-700 dark:bg-gray-800 md:flex">
        <div className="flex h-14 items-center justify-between border-b px-4 dark:border-gray-700">
          <h1 className="text-lg font-bold text-blue-600">Debts App</h1>
          <NotificationBell dropdownAlign="left" />
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-white transition-transform duration-200 dark:border-gray-700 dark:bg-gray-800 md:hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-14 items-center justify-between border-b px-6 dark:border-gray-700">
          <h1 className="text-lg font-bold text-blue-600">Debts App</h1>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 dark:border-gray-700">
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <button onClick={() => { handleLogout(); setSidebarOpen(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-white px-4 dark:border-gray-700 dark:bg-gray-800 md:hidden">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 cursor-pointer">
              <Menu className="h-6 w-6" />
            </button>
            <ThemeToggle />
          </div>
          <h1 className="text-lg font-bold text-blue-600">Debts App</h1>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={handleLogout} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
