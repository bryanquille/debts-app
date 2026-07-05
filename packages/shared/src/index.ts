import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const CreateDebtSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  totalAmount: z.number().positive(),
  userRole: z.enum(["debtor", "creditor"]),
  otherPartyEmail: z.string().email().optional(),
  otherPartyName: z.string().min(1).optional(),
}).refine(
  (data) => data.otherPartyEmail || data.otherPartyName,
  { message: "Debe especificar un usuario o nombre para la otra parte" }
);

export const CreatePaymentSchema = z.object({
  amount: z.coerce.number().positive(),
  notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateDebtInput = z.infer<typeof CreateDebtSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

export const UpdateDebtSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  totalAmount: z.number().positive().optional(),
});

export type UpdateDebtInput = z.infer<typeof UpdateDebtSchema>;
