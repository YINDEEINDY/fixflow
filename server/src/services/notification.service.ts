import { prisma } from '../config/db.js';

type NotificationType =
  | 'request_created'
  | 'request_assigned'
  | 'request_accepted'
  | 'request_rejected'
  | 'request_started'
  | 'request_completed'
  | 'request_rated';

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    },
  });

  return notification;
}

export async function getNotifications(userId: string, unreadOnly = false) {
  const where: { userId: string; isRead?: boolean } = { userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return notifications;
}

export async function getUnreadCount(userId: string) {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return count;
}

export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error('NOTIFICATION_NOT_FOUND');
  }

  if (notification.userId !== userId) {
    throw new Error('FORBIDDEN');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return { success: true };
}

// Helper functions to create specific notifications
export async function notifyRequestAssigned(requestId: string, technicianUserId: string, requestNumber: string) {
  return createNotification({
    userId: technicianUserId,
    type: 'request_assigned',
    title: 'งานใหม่',
    message: `คุณได้รับมอบหมายงาน ${requestNumber}`,
    link: `/requests/${requestId}`,
  });
}

export async function notifyRequestAccepted(requestId: string, requesterUserId: string, requestNumber: string) {
  return createNotification({
    userId: requesterUserId,
    type: 'request_accepted',
    title: 'ช่างรับงานแล้ว',
    message: `คำร้อง ${requestNumber} ได้รับการรับงานโดยช่างแล้ว`,
    link: `/requests/${requestId}`,
  });
}

export async function notifyRequestStarted(requestId: string, requesterUserId: string, requestNumber: string) {
  return createNotification({
    userId: requesterUserId,
    type: 'request_started',
    title: 'เริ่มดำเนินการ',
    message: `คำร้อง ${requestNumber} เริ่มดำเนินการแล้ว`,
    link: `/requests/${requestId}`,
  });
}

export async function notifyRequestCompleted(requestId: string, requesterUserId: string, requestNumber: string) {
  return createNotification({
    userId: requesterUserId,
    type: 'request_completed',
    title: 'งานเสร็จสิ้น',
    message: `คำร้อง ${requestNumber} เสร็จสิ้นแล้ว กรุณาให้คะแนน`,
    link: `/requests/${requestId}`,
  });
}
