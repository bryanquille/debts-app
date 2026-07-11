import prisma from "../utils/prisma.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import * as notificationService from "./notificationService.js";

export interface CreatePaymentInput {
  amount: number;
  debtId: string;
  userId: string;
  imageKey?: string;
  imageUrl?: string;
  note?: string;
  paymentDate?: string;
}

export async function createPayment(input: CreatePaymentInput) {
  const debt = await prisma.debt.findUnique({
    where: { id: input.debtId },
    include: {
      creditor: { select: { id: true, name: true } },
      debtor: { select: { id: true, name: true } },
    },
  });

  if (!debt) throw new NotFoundError("Debt not found");

  const isDebtor = debt.debtorId === input.userId;
  const isCreditor = debt.creditorId === input.userId;

  if (!isDebtor && !isCreditor) {
    throw new ForbiddenError("You are not involved in this debt");
  }

  if (debt.status !== "ACTIVE" && debt.status !== "PENDING_LIQUIDATION") {
    throw new ForbiddenError("Cannot make payments to a debt that is settled or cancelled");
  }

  if (isCreditor && debt.debtorId !== null) {
    throw new ForbiddenError("Only the debtor can register payments. The debtor has an account.");
  }

  const [payment] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        amount: input.amount,
        debtId: input.debtId,
        userId: input.userId,
        imageKey: input.imageKey || null,
        imageUrl: input.imageUrl || null,
        note: input.note || null,
        paymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
    prisma.debt.update({
      where: { id: input.debtId },
      data: { paidAmount: { increment: input.amount } },
    }),
  ]);

  const counterpartyId = isCreditor ? debt.debtorId : debt.creditorId;
  if (counterpartyId) {
    await notificationService.createNotification({
      userId: counterpartyId,
      type: "PAYMENT_RECEIVED",
      title: "Pago registrado",
      message: `Se ha registrado un pago de ${input.amount} en "${debt.description || "sin descripción"}"`,
      debtId: debt.id,
    });
  }

  return payment;
}

export async function getPaymentsByDebt(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }

  const payments = await prisma.payment.findMany({
    where: { debtId },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return payments;
}
