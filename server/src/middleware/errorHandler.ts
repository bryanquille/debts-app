// middleware/errorHandler.ts — Middleware global para manejar errores
//
// Express ejecuta este middleware cuando un controlador llama a next(error)
// o cuando ocurre una excepción en un handler async (Express 5 atrapa las promesas rechazadas automáticamente)
//
// Diferencias con Express 5:
// - Express 5 captura automáticamente errores en handlers async
// - Ya no necesitas express-async-errors ni try/catch en cada ruta

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Si es un error nuestro (AppError), usamos su statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Si es un error de validación de Zod, lo formateamos bonito
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(400).json({
      error: "Validation error",
      details: formattedErrors,
    });
    return;
  }

  // Para errores inesperados, respondemos con 500 y un mensaje genérico
  // (no filtramos el error real en producción por seguridad)
  console.error("Unexpected error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
}