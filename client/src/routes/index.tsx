import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import {
  FileText,
  ImageUp,
  ClipboardCheck,
  BadgeCheck,
  ArrowRight,
  UserPlus,
  Handshake,
  CircleDollarSign,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    router.navigate({ to: "/debts" });
    return null;
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
            Controla tus{" "}
            <span className="text-blue-600">deudas</span> de forma
            simple y transparente
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400 sm:text-xl">
            Registra deudas, haz abonos con comprobantes, y liquida todo en un
            solo lugar. Tanto si prestas como si te prestan, Debts App te da el
            control total.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.navigate({ to: "/register" })}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Comenzar Gratis
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.navigate({ to: "/login" })}
            >
              Iniciar Sesión
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mockup / decorative element */}
        <div className="mx-auto mt-20 max-w-5xl rounded-2xl border bg-gradient-to-b from-blue-50 to-white p-2 shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
          <div className="rounded-xl border bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Deuda: Préstamo para el auto
                </span>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Pendiente · $5,000
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">$10,000</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Pagado</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">$5,000</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">Restante</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">$5,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-white py-20 dark:border-gray-700 dark:bg-gray-900 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              Todo lo que necesitas para gestionar deudas
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Una herramienta pensada para que nunca pierdas el control de tus
              finanzas personales.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                Registro de Deudas
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Crea deudas con monto, descripción y vencimiento. Vincula
                usuarios registrados o asigna un nombre.
              </p>
            </div>

            <div className="rounded-xl border p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400">
                <ImageUp className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                Comprobantes de Pago
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Sube fotos de vouchers, transferencias o recibos como respaldo
                de cada abono.
              </p>
            </div>

            <div className="rounded-xl border p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                Control Total
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Tanto el acreedor como el deudor ven el historial completo de
                pagos y el saldo restante.
              </p>
            </div>

            <div className="rounded-xl border p-6 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                <BadgeCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">
                Liquidaciones
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                El deudor solicita liquidación; el acreedor revisa los pagos y
                confirma. Todo queda registrado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t bg-gray-50 py-20 dark:border-gray-700 dark:bg-gray-800/50 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              En solo 3 pasos puedes empezar a gestionar tus deudas.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <div className="mt-4">
                <UserPlus className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Crea tu cuenta
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Regístrate con tu correo. Es gratis y no requiere tarjeta.
                </p>
              </div>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <div className="mt-4">
                <Handshake className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Registra las deudas
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Crea deudas como acreedor o deudor. Añade montos, fechas y
                  descripciones.
                </p>
              </div>
            </div>

            <div className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <div className="mt-4">
                <CircleDollarSign className="mx-auto h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Paga y liquida
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Haz abonos con comprobantes, solicita liquidación y recibe la
                  confirmación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-white py-20 dark:border-gray-700 dark:bg-gray-900 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            ¿Listo para tomar el control?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Únete gratis y empieza a gestionar tus deudas de forma clara,
            organizada y transparente.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={() => router.navigate({ to: "/register" })}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Crear mi cuenta gratis
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.navigate({ to: "/login" })}
            >
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}