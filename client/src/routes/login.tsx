import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@/components/ui";
import { sileo } from "sileo";
import api from "@/lib/axios";
import type { AuthResponse, LoginInput } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Correo invalido"),
  password: z.string().min(1, "Contrasena requerida"),
});

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/debts" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      login(res.data.user, res.data.accessToken);
      sileo.success({ title: "Inicio de sesion exitoso" });
      router.navigate({ to: "/debts" });
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Credenciales invalidas",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Iniciar Sesion</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales para acceder</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="email" label="Correo electronico" type="email" placeholder="tu@correo.com"
            error={errors.email?.message} {...register("email")} />
          <Input id="password" label="Contrasena" type="password" placeholder="......"
            error={errors.password?.message} showPasswordToggle {...register("password")} />
          <Button type="submit" loading={isSubmitting} className="w-full">Iniciar Sesion</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No tienes cuenta?{" "}
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Registrate</a>
        </p>
      </div>
    </div>
  );
}
