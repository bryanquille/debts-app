// services/debtService.ts — Lógica de negocio para deudas
//
// Reglas de negocio:
// - Cualquier usuario registrado puede crear una deuda (como acreedor o deudor)
// - El debtorId es opcional (el deudor puede no estar registrado)
// - Si no hay debtorId, se usa debtorName para identificar al deudor
// - Solo el acreedor puede editar/cancelar una deuda activa
// - Solo el deudor puede solicitar liquidación (y debe haber pagado >= monto total)
// - Solo el acreedor puede liquidar la deuda (cambiar estado a SETTLED)

import prisma from "../utils/prisma.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import type { DebtStatus } from "@prisma/client";

export interface CreateDebtInput {
  amount: number;
  description?: string;
  debtorId?: string;
  debtorName?: string;
  dueDate?: string;
  creditorId: string; // Viene del token JWT (usuario autenticado)
}

export interface UpdateDebtInput {
  amount?: number;
  description?: string;
  dueDate?: string;
}

export async function createDebt(input: CreateDebtInput) {
  // Si se proporciona debtorId, verificar que el usuario exista
  if (input.debtorId) {
    const debtor = await prisma.user.findUnique({
      where: { id: input.debtorId },
    });
    if (!debtor) {
      throw new NotFoundError("Debtor user not found");
    }
  }

  // Crear la deuda en la BD
  const debt = await prisma.debt.create({
    data: {
      amount: input.amount,
      description: input.description || null,
      debtorId: input.debtorId || null,
      debtorName: input.debtorName || null,
      creditorId: input.creditorId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      paidAmount: 0,
      status: "ACTIVE",
    },
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return debt;
}

export async function getDebts(userId: string, status?: string) {
  // Buscar deudas donde el usuario sea acreedor O deudor
  const where: any = {
    OR: [
      { creditorId: userId },
      { debtorId: userId },
    ],
  };

  // Filtrar por estado si se especifica
  if (status && ["ACTIVE", "PENDING_LIQUIDATION", "SETTLED", "CANCELLED"].includes(status)) {
    where.status = status;
  }

  const debts = await prisma.debt.findMany({
    where,
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { payments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return debts;
}

export async function getDebtById(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
      payments: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Verificar que el usuario esté involucrado en la deuda
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }

  return debt;
}

export async function updateDebt(
  debtId: string,
  userId: string,
  input: UpdateDebtInput
) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Solo el acreedor puede editar
  if (debt.creditorId !== userId) {
    throw new ForbiddenError("Only the creditor can edit this debt");
  }

  // Solo se puede editar si está activa
  if (debt.status !== "ACTIVE") {
    throw new ForbiddenError("Cannot edit a debt that is not active");
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      amount: input.amount,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedDebt;
}

export async function requestLiquidation(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Solo el deudor puede solicitar liquidación
  if (debt.debtorId !== userId) {
    throw new ForbiddenError("Only the debtor can request liquidation");
  }

  // La deuda debe estar activa
  if (debt.status !== "ACTIVE") {
    throw new ForbiddenError("Debt is not active");
  }

  // El monto pagado debe ser >= al monto total
  if (Number(debt.paidAmount) < Number(debt.amount)) {
    throw new ForbiddenError(
      "Cannot request liquidation: total amount not yet paid"
    );
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "PENDING_LIQUIDATION" },
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedDebt;
}

export async function settleDebt(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Solo el acreedor puede liquidar la deuda oficialmente
  if (debt.creditorId !== userId) {
    throw new ForbiddenError("Only the creditor can settle this debt");
  }

  // La deuda debe estar en estado PENDING_LIQUIDATION
  if (debt.status !== "PENDING_LIQUIDATION") {
    throw new ForbiddenError(
      "Debt must be in PENDING_LIQUIDATION status to settle"
    );
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "SETTLED" },
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedDebt;
}

export async function cancelDebt(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Solo el acreedor puede cancelar
  if (debt.creditorId !== userId) {
    throw new ForbiddenError("Only the creditor can cancel this debt");
  }

  // Solo se puede cancelar si está activa
  if (debt.status !== "ACTIVE") {
    throw new ForbiddenError("Cannot cancel a debt that is not active");
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "CANCELLED" },
    include: {
      creditor: {
        select: { id: true, name: true, email: true },
      },
      debtor: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return updatedDebt;
}