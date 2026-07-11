import { Request, Response } from "express";
import * as notificationService from "../services/notificationService.js";

export async function getNotifications(req: Request, res: Response) {
  const notifications = await notificationService.getNotifications(req.user!.userId);
  res.json(notifications);
}

export async function getUnreadCount(req: Request, res: Response) {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.json({ count });
}

export async function markAsRead(req: Request, res: Response) {
  const id = req.params.id as string;
  const notification = await notificationService.markAsRead(id, req.user!.userId);
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(notification);
}

export async function markAllAsRead(req: Request, res: Response) {
  await notificationService.markAllAsRead(req.user!.userId);
  res.json({ message: "All notifications marked as read" });
}
