// services/userService.ts — Lógica de negocio para usuarios
// De momento solo tiene perfil propio, pero aquí iría la lógica de
// actualizar avatar, cambiar contraseña, etc.

import prisma from "../utils/prisma.js";
import { NotFoundError } from "../utils/errors.js";

export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: {
          debtsAsCreditor: true,
          debtsAsDebtor: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      avatar: input.avatar,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  return user;
}

export async function searchUsers(query: string) {
  // Buscar usuarios por nombre o email (para vincular deudor al crear deuda)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
    take: 10, // Máximo 10 resultados
  });

  return users;
}