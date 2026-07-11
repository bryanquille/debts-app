import { Request, Response } from "express";
import { z } from "zod";
import * as userService from "../services/userService.js";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
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

export async function searchUsers(req: Request, res: Response) {
  const query = req.query.q as string;
  if (!query || query.length < 2) {
    res.json([]);
    return;
  }
  const users = await userService.searchUsers(query, req.user?.userId);
  res.json(users);
}
