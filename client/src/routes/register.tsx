import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@/components/ui";
import { PasswordStrength } from "@/components/ui/passwordStrength";
import { sileo } from "sileo";
import api from "@/lib/axios";
import type { AuthResponse, RegisterInput } from "@/types";

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo invalido"),
  password: z
    .string()
    .min(10, "La contrasena debe tener al menos 10 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
    .regex(/[0-9]/, "Debe contener al menos un numero")
    .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),
});

export const Route = createFileRoute("/register")({
  beforeLoad: async () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/debts" });
    }
  },
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      login(res.data.user, res.data.accessToken);
      sileo.success({ title: "Cuenta creada exitosamente" });
      router.navigate({ to: "/debts" });
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
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Registrate para empezar a gestionar tus deudas</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="name" label="Nombre completo" placeholder="Juan Perez" error={errors.name?.message} {...register("name")} />
          <Input id="email" label="Correo electronico" type="email" placeholder="tu@correo.com" error={errors.email?.message} {...register("email")} />
          <div className="space-y-2">
            <Input id="password" label="Contrasena" type="password" placeholder="Minimo 10 caracteres"
              error={errors.password?.message} showPasswordToggle {...register("password")} />
            <PasswordStrength password={watchedPassword} />
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">Crear Cuenta</Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Ya tienes cuenta?{" "}
          <a href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">Inicia sesion</a>
        </p>
      </div>
    </div>
  );
}
