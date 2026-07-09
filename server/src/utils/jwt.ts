// utils/jwt.ts — Funciones para generar y verificar tokens JWT
//
// JWT (JSON Web Token) es un formato de token seguro que contiene:
// - Header: algoritmo de encriptación
// - Payload: datos (ej: userId, email)
// - Signature: firma que verifica que el token no fue alterado
//
// Access Token: dura 15 minutos, se usa para autenticar requests
// Refresh Token: dura 7 días, se usa para obtener nuevos access tokens

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";

export interface TokenPayload {
  userId: string;
  email: string;
}

// Genera un access token (corta duración: 15 minutos)
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

// Genera un refresh token (larga duración: 7 días)
export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

// Verifica y decodifica un access token
// Si es válido, devuelve el payload. Si no, lanza error.
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

// Verifica y decodifica un refresh token
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}