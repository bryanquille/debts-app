import { Request, Response } from "express";
import { z } from "zod";
import * as debtService from "../services/debtService.js";

const createDebtSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  debtorId: z.string().uuid().optional(),
  debtorName: z.string().optional(),
  dueDate: z.string().optional(),
});

const updateDebtSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createDebt(req: Request, res: Response) {
  const input = createDebtSchema.parse(req.body);
  const debt = await debtService.createDebt({
    ...input,
    creditorId: req.user!.userId,
  });
  res.status(201).json(debt);
}

export async function getDebts(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const debts = await debtService.getDebts(req.user!.userId, status);
  res.json(debts);
}

export async function getDebtById(req: Request, res: Response) {
  const id = req.params.id as string;
  const debt = await debtService.getDebtById(id, req.user!.userId);
  res.json(debt);
}

export async function updateDebt(req: Request, res: Response) {
  const id = req.params.id as string;
  const input = updateDebtSchema.parse(req.body);
  const debt = await debtService.updateDebt(id, req.user!.userId, input);
  res.json(debt);
}

export async function requestLiquidation(req: Request, res: Response) {
  const id = req.params.id as string;
  const debt = await debtService.requestLiquidation(id, req.user!.userId);
  res.json(debt);
}

export async function settleDebt(req: Request, res: Response) {
  const id = req.params.id as string;
  const debt = await debtService.settleDebt(id, req.user!.userId);
  res.json(debt);
}

export async function cancelDebt(req: Request, res: Response) {
  const id = req.params.id as string;
  const debt = await debtService.cancelDebt(id, req.user!.userId);
  res.json(debt);
}