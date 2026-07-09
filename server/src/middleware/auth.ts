// middleware/auth.ts — Middleware de autenticación JWT
//
// Este middleware se ejecuta ANTES de los controladores que requieren autenticación.
// Hace lo siguiente:
// 1. Toma el token del header "Authorization: Bearer <token>"
// 2. Verifica que el token sea válido (no expirado, firma correcta)
// 3. Si es válido, agrega los datos del usuario (userId, email) a req
// 4. Si no es válido, responde con 401 Unauthorized
//
// En Express 5, los middleware pueden ser async directamente (no necesitan express-async-errors)

import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt.js";

// Extendemos el tipo Request de Express para incluir el usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    // Agregamos el usuario decodificado al request para que los controladores lo usen
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
}