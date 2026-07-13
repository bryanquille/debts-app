// services/authService.ts — Lógica de negocio para autenticación
//
// Este servicio contiene las funciones que:
// 1. Registran un nuevo usuario (hash de password, crear en BD)
// 2. Verifican credenciales (comparar password con hash)
// 3. Generan tokens JWT
//
// NOTA: Nunca almacenamos contraseñas en texto plano.
// Usamos bcryptjs para hashear: bcryptjs aplica un algoritmo de hash + salt
// que hace casi imposible revertir la contraseña incluso si alguien accede a la BD.

import bcrypt from "bcryptjs";
import prisma from "../utils/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  TokenPayload,
} from "../utils/jwt.js";
import { UnauthorizedError } from "../utils/errors.js";

// Número de rondas de hash para bcrypt
// Más rondas = más seguro, pero más lento
// 10 es un buen balance seguridad/rendimiento
const SALT_ROUNDS = 10;

export interface RegisterInput {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  credential: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new UnauthorizedError("Email already registered");
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: input.username },
  });

  if (existingUsername) {
    throw new UnauthorizedError("Username already taken");
  }

  // Hashear la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      username: input.username,
      password: hashedPassword,
    },
  });

  // Generar tokens JWT
  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.credential },
        { username: input.credential },
      ],
    },
  });

  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isValidPassword = await bcrypt.compare(input.password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string }> {
  // Verificar el refresh token usando la función que vimos en utils/jwt.ts
  const { verifyRefreshToken } = await import("../utils/jwt.js");
  const decoded = verifyRefreshToken(refreshToken);

  // Generar nuevo access token
  const payload: TokenPayload = {
    userId: decoded.userId,
    email: decoded.email,
  };
  const accessToken = generateAccessToken(payload);

  return { accessToken };
}