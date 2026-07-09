// services/paymentService.ts — Lógica de negocio para pagos/abonos
//
// Cuando se registra un pago:
// 1. Se crea el registro de pago en la BD
// 2. Se actualiza el paidAmount de la deuda sumando el monto del pago
// 3. Si el pago supera el monto total NO se cambia el estado automáticamente
//    (el deudor debe solicitar la liquidación explícitamente)

import prisma from "../utils/prisma.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";

export interface CreatePaymentInput {
  amount: number;
  debtId: string;
  userId: string;
  imageKey?: string;
  imageUrl?: string;
  note?: string;
}

export async function createPayment(input: CreatePaymentInput) {
  // Verificar que la deuda exista
  const debt = await prisma.debt.findUnique({ where: { id: input.debtId } });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Verificar que el usuario esté involucrado en la deuda
  if (debt.creditorId !== input.userId && debt.debtorId !== input.userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }

  // Verificar que la deuda esté activa (no se pueden hacer pagos en deudas liquidadas/canceladas)
  if (debt.status !== "ACTIVE" && debt.status !== "PENDING_LIQUIDATION") {
    throw new ForbiddenError("Cannot make payments to a debt that is settled or cancelled");
  }

  // Crear el pago y actualizar el paidAmount en una transacción
  // Una transacción de Prisma asegura que AMBAS operaciones se ejecuten juntas
  // (si una falla, ambas se revierten — como si nada hubiera pasado)
  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        amount: input.amount,
        debtId: input.debtId,
        userId: input.userId,
        imageKey: input.imageKey || null,
        imageUrl: input.imageUrl || null,
        note: input.note || null,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.debt.update({
      where: { id: input.debtId },
      data: {
        paidAmount: {
          increment: input.amount, // Incrementa el paidAmount actual
        },
      },
    }),
  ]);

  return payment;
}

export async function getPaymentsByDebt(debtId: string, userId: string) {
  // Verificar que la deuda exista
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });

  if (!debt) {
    throw new NotFoundError("Debt not found");
  }

  // Verificar que el usuario esté involucrado
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }

  const payments = await prisma.payment.findMany({
    where: { debtId },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
}