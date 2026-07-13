import { Request, Response } from "express";
import { z } from "zod";
import * as userService from "../services/userService.js";

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
    .optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(10, "Password must be at least 10 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function getProfile(req: Request, res: Response) {
  const profile = await userService.getUserProfile(req.user!.userId);
  res.json(profile);
}

export async function updateProfile(req: Request, res: Response) {
  const input = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfile(req.user!.userId, input);
  res.json(user);
}

export async function changePassword(req: Request, res: Response) {
  const input = changePasswordSchema.parse(req.body);
  await userService.updatePassword(req.user!.userId, input.currentPassword, input.newPassword);
  res.json({ message: "Password changed successfully" });
}

export async function searchUsers(req: Request, res: Response) {
  const query = req.query.q as string;
  if (!query || query.length < 2) {
    res.json([]);
    return;
  }
  const users = await userService.searchUsers(query, req.user?.userId);
  res.json(users);
}
