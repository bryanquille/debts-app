import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Función utilitaria para combinar clases de Tailwind sin conflictos
// twMerge resuelve conflictos entre clases (ej: "px-4 px-6" → solo "px-6")
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatear decimales como moneda
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(num);
}

// Formatear fecha
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}