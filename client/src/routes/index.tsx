import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import { ArrowRight, Shield, Wallet, BellRing, CreditCard, Landmark, Percent } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    await useAuthStore.getState().initialize();
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/debts" });
    }
  },
  component: LandingPage,
});

function LandingPage() {
  const router = useRouter();

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-gray-100">
            Controla tus{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              deudas
            </span>{" "}
            de forma simple
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
            Registra, organiza y da seguimiento a tus prestamos y deudas. Manten un control claro de quien te debe y a quien le debes.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" onClick={() => router.navigate({ to: "/register" })}>
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              const el = document.getElementById("features");
              el?.scrollIntoView({ behavior: "smooth" });
            }}>
              Ver Caracteristicas
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="border-t bg-gray-50 py-20 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">Caracteristicas</h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">Todo lo que necesitas para gestionar tus deudas</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CreditCard, title: "Multiples Deudas", desc: "Registra tantas deudas como necesites, organizadas por estado" },
              { icon: Wallet, title: "Registro de Pagos", desc: "Lleva el control de cada abono realizado con fecha y comprobante" },
              { icon: Shield, title: "Doble Rol", desc: "Se ambos, acreedor y deudor, con vistas separadas para cada rol" },
              { icon: BellRing, title: "Notificaciones", desc: "Recibe alertas de pagos, solicitudes de liquidacion y mas" },
              { icon: Landmark, title: "Solicitud de Liquidacion", desc: "El deudor solicita liquidar, el acreedor confirma" },
              { icon: Percent, title: "Sin Intereses", desc: "App gratuita, sin comisiones ni costos ocultos" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border border-gray-300 bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:border-gray-600 dark:bg-gray-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">Como funciona</h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">En solo 3 pasos</p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Crea tu cuenta", desc: "Registrate con tu correo electronico. Es gratis y no requiere tarjeta." },
              { step: "2", title: "Registra deudas", desc: "Agrega deudas como acreedor o deudor, con monto, descripcion y fecha limite." },
              { step: "3", title: "Da seguimiento", desc: "Registra pagos, solicita liquidaciones y recibe notificaciones de cada movimiento." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-gray-50 py-20 dark:border-gray-700 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Listo para empezar?</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">No esperes mas, registra tu primera deuda en segundos.</p>
          <div className="mt-8">
            <Button size="lg" onClick={() => router.navigate({ to: "/register" })}>
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
