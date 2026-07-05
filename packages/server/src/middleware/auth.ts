import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "No autenticado" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}
