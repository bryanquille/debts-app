import prisma from "../utils/prisma.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import * as notificationService from "./notificationService.js";

export interface CreateDebtInput {
  amount: number;
  description?: string;
  role: "creditor" | "debtor";
  counterpartyId?: string;
  counterpartyName?: string;
  dueDate?: string;
  creditorId: string;
}

export interface UpdateDebtInput {
  amount?: number;
  description?: string;
  dueDate?: string;
}

export async function createDebt(input: CreateDebtInput) {
  let creditorId: string;
  let debtorId: string | null = null;
  let debtorName: string | null = null;
  let creditorName: string | null = null;

  if (input.role === "creditor") {
    creditorId = input.creditorId;
    if (input.counterpartyId) {
      const counterparty = await prisma.user.findUnique({ where: { id: input.counterpartyId } });
      if (!counterparty) throw new NotFoundError("User not found");
      debtorId = input.counterpartyId;
    }
    debtorName = input.counterpartyName || null;
  } else {
    debtorId = input.creditorId;
    if (input.counterpartyId) {
      const counterparty = await prisma.user.findUnique({ where: { id: input.counterpartyId } });
      if (!counterparty) throw new NotFoundError("User not found");
      creditorId = input.counterpartyId;
    } else {
      creditorId = input.creditorId;
      creditorName = input.counterpartyName || null;
    }
  }

  const debt = await prisma.debt.create({
    data: {
      amount: input.amount,
      description: input.description || null,
      debtorId,
      debtorName,
      creditorName,
      creditorId,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      paidAmount: 0,
      status: "ACTIVE",
    },
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
    },
  });

  return debt;
}

export async function getDebts(userId: string, status?: string, role?: string) {
  const where: any = {};

  if (role === "creditor") {
    where.creditorId = userId;
  } else if (role === "debtor") {
    where.debtorId = userId;
  } else {
    where.OR = [{ creditorId: userId }, { debtorId: userId }];
  }

  if (status && ["ACTIVE", "PENDING_LIQUIDATION", "SETTLED", "CANCELLED"].includes(status)) {
    where.status = status;
  }

  const debts = await prisma.debt.findMany({
    where,
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
      _count: { select: { payments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return debts;
}

export async function getDebtById(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
      payments: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }

  return debt;
}

export async function updateDebt(debtId: string, userId: string, input: UpdateDebtInput) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId) throw new ForbiddenError("Only the creditor can edit this debt");
  if (debt.status !== "ACTIVE") throw new ForbiddenError("Cannot edit a debt that is not active");

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: {
      amount: input.amount,
      description: input.description,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
    },
  });

  return updatedDebt;
}

export async function requestLiquidation(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.debtorId !== userId) throw new ForbiddenError("Only the debtor can request liquidation");
  if (debt.status !== "ACTIVE") throw new ForbiddenError("Debt is not active");
  if (Number(debt.paidAmount) < Number(debt.amount)) {
    throw new ForbiddenError("Cannot request liquidation: total amount not yet paid");
  }

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "PENDING_LIQUIDATION" },
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
    },
  });

  await notificationService.createNotification({
    userId: debt.creditorId,
    type: "LIQUIDATION_REQUEST",
    title: "Solicitud de liquidación",
    message: `El deudor ha solicitado liquidar la deuda "${debt.description || "sin descripción"}"`,
    debtId: debt.id,
  });

  return updatedDebt;
}

export async function settleDebt(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId) throw new ForbiddenError("Only the creditor can settle this debt");
  if (debt.status !== "PENDING_LIQUIDATION") throw new ForbiddenError("Debt must be in PENDING_LIQUIDATION status to settle");

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "SETTLED" },
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
    },
  });

  if (debt.debtorId) {
    await notificationService.createNotification({
      userId: debt.debtorId,
      type: "DEBT_SETTLED",
      title: "Deuda liquidada",
      message: `El acreedor ha confirmado la liquidación de "${debt.description || "sin descripción"}"`,
      debtId: debt.id,
    });
  }

  return updatedDebt;
}

export async function cancelDebt(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId) throw new ForbiddenError("Only the creditor can cancel this debt");
  if (debt.status !== "ACTIVE") throw new ForbiddenError("Cannot cancel a debt that is not active");

  const updatedDebt = await prisma.debt.update({
    where: { id: debtId },
    data: { status: "CANCELLED" },
    include: {
      creditor: { select: { id: true, name: true, email: true } },
      debtor: { select: { id: true, name: true, email: true } },
    },
  });

  return updatedDebt;
}

export async function requestDeletion(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }
  if (debt.status !== "ACTIVE" && debt.status !== "PENDING_LIQUIDATION") {
    throw new ForbiddenError("Cannot delete a debt that is already settled or cancelled");
  }
  if (debt.deletionRequestedBy) {
    throw new ForbiddenError("A deletion request is already pending");
  }

  const counterpartyId = debt.creditorId === userId ? debt.debtorId : debt.creditorId;

  await prisma.debt.update({
    where: { id: debtId },
    data: { deletionRequestedBy: userId },
  });

  if (counterpartyId) {
    const requesterName = debt.creditorId === userId ? "El acreedor" : "El deudor";

    await notificationService.createNotification({
      userId: counterpartyId,
      type: "DELETION_REQUEST",
      title: "Solicitud de eliminación",
      message: `${requesterName} solicita eliminar la deuda "${debt.description || "sin descripción"}"`,
      debtId: debt.id,
    });
  }

  return { message: "Deletion request sent" };
}

export async function approveDeletion(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: {
      creditor: { select: { name: true } },
      debtor: { select: { name: true } },
    },
  });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }
  if (!debt.deletionRequestedBy) {
    throw new ForbiddenError("No deletion request pending");
  }
  if (debt.deletionRequestedBy === userId) {
    throw new ForbiddenError("You cannot approve your own deletion request");
  }

  const counterpartyId = debt.deletionRequestedBy;

  await prisma.debt.update({
    where: { id: debtId },
    data: { status: "CANCELLED", deletionRequestedBy: null },
  });

  await notificationService.createNotification({
    userId: counterpartyId,
    type: "DELETION_APPROVED",
    title: "Eliminación aprobada",
    message: `La solicitud de eliminación de "${debt.description || "sin descripción"}" ha sido aprobada`,
    debtId: debt.id,
  });

  return { message: "Deletion approved, debt cancelled" };
}

export async function rejectDeletion(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: {
      creditor: { select: { name: true } },
      debtor: { select: { name: true } },
    },
  });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }
  if (!debt.deletionRequestedBy) {
    throw new ForbiddenError("No deletion request pending");
  }
  if (debt.deletionRequestedBy === userId) {
    throw new ForbiddenError("You cannot reject your own deletion request");
  }

  const counterpartyId = debt.deletionRequestedBy;

  await prisma.debt.update({
    where: { id: debtId },
    data: { deletionRequestedBy: null },
  });

  await notificationService.createNotification({
    userId: counterpartyId,
    type: "DELETION_REJECTED",
    title: "Eliminación rechazada",
    message: `La solicitud de eliminación de "${debt.description || "sin descripción"}" ha sido rechazada`,
    debtId: debt.id,
  });

  return { message: "Deletion request rejected" };
}

export async function getDebtForDeletionStatus(debtId: string, userId: string) {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    select: {
      id: true,
      deletionRequestedBy: true,
      creditorId: true,
      debtorId: true,
    },
  });
  if (!debt) throw new NotFoundError("Debt not found");
  if (debt.creditorId !== userId && debt.debtorId !== userId) {
    throw new ForbiddenError("You are not involved in this debt");
  }
  return debt;
}
