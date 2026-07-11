import prisma from "../utils/prisma.js";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  debtId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      debtId: input.debtId || null,
    },
  });
  return notification;
}

export async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return notifications;
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: { userId, read: false },
  });
  return count;
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.userId !== userId) return null;

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
  return updated;
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function hasUnreadDeletionRequest(debtId: string, userId: string) {
  const notification = await prisma.notification.findFirst({
    where: {
      userId,
      debtId,
      type: "DELETION_REQUEST",
      read: false,
    },
  });
  return !!notification;
}
