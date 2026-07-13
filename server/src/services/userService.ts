import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import { NotFoundError, UnauthorizedError, ConflictError } from "../utils/errors.js";

const SALT_ROUNDS = 10;

export interface UpdateProfileInput {
  name?: string;
  username?: string;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
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
  if (input.username) {
    const existing = await prisma.user.findUnique({
      where: { username: input.username },
    });
    if (existing && existing.id !== userId) {
      throw new ConflictError("Username already taken");
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      username: input.username,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
    },
  });

  return user;
}

export async function updatePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export async function searchUsers(query: string, excludeUserId?: string) {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        excludeUserId ? { id: { not: excludeUserId } } : {},
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
    },
    take: 10,
  });

  return users;
}
