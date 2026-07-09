import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@/components/ui";
import { sileo } from "sileo";
import api from "@/lib/axios";
import type { AuthResponse, RegisterInput } from "@/types";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      login(res.data.user, res.data.accessToken);
      sileo.success({ title: "Cuenta creada exitosamente" });
      router.navigate({ to: "/" });
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Error al crear cuenta",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Crear Cuenta</h1>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Regístrate para empezar a gestionar tus deudas
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Nombre completo"
            placeholder="Juan Pérez"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Crear Cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}