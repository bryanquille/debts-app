// types/index.ts — Tipos compartidos entre frontend y backend
//
// Estos tipos reflejan la estructura de datos del backend.
// Al usar Prisma + TypeScript en el backend, los tipos son generados automáticamente,
// pero aquí los definimos manualmente para el frontend.

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export type DebtStatus = "ACTIVE" | "PENDING_LIQUIDATION" | "SETTLED" | "CANCELLED";

export interface Debt {
  id: string;
  amount: number;
  description: string | null;
  status: DebtStatus;
  paidAmount: number;
  creditorId: string;
  debtorId: string | null;
  debtorName: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  creditor: User;
  debtor: User | null;
  payments?: Payment[];
  _count?: { payments: number };
}

export interface Payment {
  id: string;
  amount: number;
  debtId: string;
  userId: string;
  imageKey: string | null;
  imageUrl: string | null;
  note: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}