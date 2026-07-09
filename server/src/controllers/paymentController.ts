import { Request, Response } from "express";
import { z } from "zod";
import * as paymentService from "../services/paymentService.js";

const createPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  imageKey: z.string().optional(),
  imageUrl: z.string().url().optional(),
  note: z.string().optional(),
});

export async function createPayment(req: Request, res: Response) {
  const debtId = req.params.id as string;
  const input = createPaymentSchema.parse(req.body);
  const payment = await paymentService.createPayment({
    ...input,
    debtId,
    userId: req.user!.userId,
  });
  res.status(201).json(payment);
}

export async function getPayments(req: Request, res: Response) {
  const debtId = req.params.id as string;
  const payments = await paymentService.getPaymentsByDebt(debtId, req.user!.userId);
  res.json(payments);
}