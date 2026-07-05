import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { CreateDebtSchema, UpdateDebtSchema } from "shared";

const router: Router = Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const data = CreateDebtSchema.parse(req.body);
    const userId = req.user!.id;

    let debtorId: string | null = null;
    let debtorName: string | null = null;
    let creditorId: string | null = null;
    let creditorName: string | null = null;

    if (data.userRole === "debtor") {
      debtorId = userId;
      if (data.otherPartyEmail) {
        const other = await prisma.user.findUnique({ where: { email: data.otherPartyEmail } });
        if (!other) {
          res.status(404).json({ message: "Usuario no encontrado" });
          return;
        }
        creditorId = other.id;
      } else {
        creditorName = data.otherPartyName!;
      }
    } else {
      creditorId = userId;
      if (data.otherPartyEmail) {
        const other = await prisma.user.findUnique({ where: { email: data.otherPartyEmail } });
        if (!other) {
          res.status(404).json({ message: "Usuario no encontrado" });
          return;
        }
        debtorId = other.id;
      } else {
        debtorName = data.otherPartyName!;
      }
    }

    const debt = await prisma.debt.create({
      data: {
        title: data.title,
        description: data.description,
        totalAmount: data.totalAmount,
        createdById: userId,
        debtorId,
        debtorName,
        creditorId,
        creditorName,
      },
      include: {
        debtor: { select: { id: true, name: true, email: true } },
        creditor: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(debt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Datos inv�lidos", errors: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/paid", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const debts = await prisma.debt.findMany({
    where: {
      status: "PAID",
      OR: [{ debtorId: userId }, { creditorId: userId }],
    },
    include: {
      debtor: { select: { id: true, name: true, email: true } },
      creditor: { select: { id: true, name: true, email: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  interface DebtWithPayments {
    id: string;
    title: string;
    description: string | null;
    totalAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
    debtorId: string | null;
    debtorName: string | null;
    creditorId: string | null;
    creditorName: string | null;
    debtor: { id: string; name: string; email: string } | null;
    creditor: { id: string; name: string; email: string } | null;
    payments: { amount: number }[];
  }

  const result = (debts as DebtWithPayments[]).map((debt) => {
    const paidAmount = debt.payments.reduce((sum: number, p) => sum + p.amount, 0);
    const role = debt.debtorId === userId ? "debtor" : "creditor";
    const { payments: _, ...rest } = debt;
    return { ...rest, paidAmount, role };
  });

  res.json(result);
});

router.get("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const debts = await prisma.debt.findMany({
    where: {
      status: "ACTIVE",
      OR: [{ debtorId: userId }, { creditorId: userId }],
    },
    include: {
      debtor: { select: { id: true, name: true, email: true } },
      creditor: { select: { id: true, name: true, email: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  interface DebtWithPayments {
    id: string;
    title: string;
    description: string | null;
    totalAmount: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
    debtorId: string | null;
    debtorName: string | null;
    creditorId: string | null;
    creditorName: string | null;
    debtor: { id: string; name: string; email: string } | null;
    creditor: { id: string; name: string; email: string } | null;
    payments: { amount: number }[];
  }

  const result = (debts as DebtWithPayments[]).map((debt) => {
    const paidAmount = debt.payments.reduce((sum: number, p) => sum + p.amount, 0);
    const role = debt.debtorId === userId ? "debtor" : "creditor";
    const { payments: _, ...rest } = debt;
    return { ...rest, paidAmount, role };
  });

  res.json(result);
});

router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.debt.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Deuda no encontrada" });
      return;
    }
    if (existing.createdById !== userId) {
      res.status(403).json({ message: "Solo el creador puede editar esta deuda" });
      return;
    }
    if (existing.status === "PAID") {
      res.status(400).json({ message: "No se puede editar una deuda pagada" });
      return;
    }

    const data = UpdateDebtSchema.parse(req.body);

    const debt = await prisma.debt.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.totalAmount !== undefined && { totalAmount: data.totalAmount }),
      },
      include: {
        debtor: { select: { id: true, name: true, email: true } },
        creditor: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(debt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Datos inv\u00e1lidos", errors: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.patch("/:id/status", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.debt.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Deuda no encontrada" });
      return;
    }
    if (existing.createdById !== userId) {
      res.status(403).json({ message: "Solo el creador puede cambiar el estado" });
      return;
    }
    if (existing.status === "PAID") {
      res.status(400).json({ message: "No se puede cambiar el estado de una deuda pagada" });
      return;
    }

    const { status } = z.object({ status: z.enum(["ACTIVE", "CANCELLED"]) }).parse(req.body);

    const debt = await prisma.debt.update({
      where: { id },
      data: { status },
      include: {
        debtor: { select: { id: true, name: true, email: true } },
        creditor: { select: { id: true, name: true, email: true } },
      },
    });

    res.json(debt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Datos inv\u00e1lidos", errors: error.errors });
      return;
    }
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.debt.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Deuda no encontrada" });
      return;
    }
    if (existing.createdById !== userId) {
      res.status(403).json({ message: "Solo el creador puede eliminar esta deuda" });
      return;
    }

    await prisma.debt.delete({ where: { id } });
    res.json({ message: "Deuda eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const debt = await prisma.debt.findUnique({
    where: { id },
    include: {
      debtor: { select: { id: true, name: true, email: true } },
      creditor: { select: { id: true, name: true, email: true } },
      payments: {
        orderBy: { paidAt: "desc" },
        include: { paidBy: { select: { id: true, name: true } } },
      },
    },
  });

  if (!debt) {
    res.status(404).json({ message: "Deuda no encontrada" });
    return;
  }

  if (debt.debtorId !== userId && debt.creditorId !== userId) {
    res.status(403).json({ message: "No tienes acceso a esta deuda" });
    return;
  }

  const paidAmount = (debt.payments ?? []).reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);
  const role = debt.debtorId === userId ? "debtor" : "creditor";

  res.json({ ...debt, paidAmount, role });
});

export default router;
