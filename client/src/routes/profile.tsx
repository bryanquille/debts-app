import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/authStore";
import { Button, Input } from "@/components/ui";
import { PasswordStrength } from "@/components/ui/passwordStrength";
import { sileo } from "sileo";
import api from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { Mail, Calendar, User as UserIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(20, "El usuario debe tener maximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, numeros y guion bajo"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contrasena actual requerida"),
    newPassword: z
      .string()
      .min(10, "La contrasena debe tener al menos 10 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayuscula")
      .regex(/[0-9]/, "Debe contener al menos un numero")
      .regex(/[^A-Za-z0-9]/, "Debe contener al menos un caracter especial"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/users/me").then((r) => r.data),
    initialData: user ? { ...user, createdAt: undefined, _count: undefined } : undefined,
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile?.name ?? "",
      username: profile?.username ?? "",
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = passwordForm.watch("newPassword", "");

  const onSaveProfile = async (data: any) => {
    try {
      const res = await api.put("/users/me", data);
      setUser(res.data);
      sileo.success({ title: "Perfil actualizado" });
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Error al actualizar perfil",
      });
    }
  };

  const onChangePassword = async (data: any) => {
    try {
      await api.put("/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      sileo.success({ title: "Contrasena cambiada exitosamente" });
      passwordForm.reset();
    } catch (err: any) {
      sileo.error({
        title: "Error",
        description: err.response?.data?.error || "Error al cambiar contrasena",
      });
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">Administra tu informacion personal</p>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{profile?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">@{profile?.username}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Editar informacion</h3>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
          <Input id="p-name" label="Nombre completo" placeholder="Juan Perez"
            error={String(profileForm.formState.errors.name?.message ?? "") || undefined} {...profileForm.register("name")} />
          <Input id="p-username" label="Nombre de usuario" placeholder="juan123"
            error={String(profileForm.formState.errors.username?.message ?? "") || undefined} {...profileForm.register("username")} />
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Correo electronico</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile?.email}</p>
            </div>
          </div>
          {profile?.createdAt && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Miembro desde</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          )}
          <Button type="submit" loading={profileForm.formState.isSubmitting}>
            Guardar cambios
          </Button>
        </form>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Cambiar contrasena</h3>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <Input id="p-current" label="Contrasena actual" type="password" placeholder="Tu contrasena actual"
            error={String(passwordForm.formState.errors.currentPassword?.message ?? "") || undefined} showPasswordToggle {...passwordForm.register("currentPassword")} />
          <div className="space-y-2">
            <Input id="p-new" label="Nueva contrasena" type="password" placeholder="Minimo 10 caracteres"
              error={String(passwordForm.formState.errors.newPassword?.message ?? "") || undefined} showPasswordToggle {...passwordForm.register("newPassword")} />
            <PasswordStrength password={watchedPassword} />
          </div>
          <Input id="p-confirm" label="Confirmar nueva contrasena" type="password" placeholder="Repite la contrasena"
            error={String(passwordForm.formState.errors.confirmPassword?.message ?? "") || undefined} showPasswordToggle {...passwordForm.register("confirmPassword")} />
          <Button type="submit" loading={passwordForm.formState.isSubmitting}>
            Cambiar contrasena
          </Button>
        </form>
      </div>
    </div>
  );
}
