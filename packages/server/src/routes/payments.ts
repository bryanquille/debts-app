import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { cloudinary } from "../lib/cloudinary";
import { CreatePaymentSchema } from "shared";

const router: Router = Router();

router.post(
  "/:debtId/payments",
  authMiddleware,
  upload.single("receipt"),
  async (req: Request, res: Response) => {
    try {
      const { debtId } = req.params;
      const userId = req.user!.id;

      const debt = await prisma.debt.findUnique({ where: { id: debtId } });
      if (!debt) {
        res.status(404).json({ message: "Deuda no encontrada" });
        return;
      }
      if (debt.debtorId !== userId && debt.creditorId !== userId) {
        res.status(403).json({ message: "No tienes acceso a esta deuda" });
        return;
      }
      if (debt.status === "PAID") {
        res.status(400).json({ message: "Esta deuda ya está pagada" });
        return;
      }

      const data = CreatePaymentSchema.parse(req.body);

      let receiptUrl: string | null = null;
      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "debts-app/receipts",
        });
        receiptUrl = result.secure_url;
      }

      const payment = await prisma.payment.create({
        data: {
          debtId,
          amount: data.amount,
          notes: data.notes,
          receipt: receiptUrl,
          paidById: userId,
          paidAt: new Date(),
        },
      });

      const totalPaid = await prisma.payment.aggregate({
        where: { debtId },
        _sum: { amount: true },
      });

      if (totalPaid._sum.amount && totalPaid._sum.amount >= debt.totalAmount) {
        await prisma.debt.update({
          where: { id: debtId },
          data: { status: "PAID" },
        });
      }

      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
        return;
      }
      console.error(error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  },
);

export default router;
