import { prisma } from '../config/db.js';
import { Role, Prisma } from '@prisma/client';

export async function getUserStats(userId: string) {
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.request.count({ where: { userId, deletedAt: null } }),
    prisma.request.count({ where: { userId, status: 'pending', deletedAt: null } }),
    prisma.request.count({
      where: {
        userId,
        status: { in: ['assigned', 'accepted', 'in_progress', 'on_hold'] },
        deletedAt: null,
      },
    }),
    prisma.request.count({ where: { userId, status: 'completed', deletedAt: null } }),
  ]);

  return { total, pending, inProgress, completed };
}

export async function getTechnicianStats(technicianUserId: string) {
  const technician = await prisma.technician.findUnique({
    where: { userId: technicianUserId },
  });

  if (!technician) {
    return { assigned: 0, inProgress: 0, completedToday: 0, rating: 0 };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [assigned, inProgress, completedToday] = await Promise.all([
    prisma.request.count({
      where: { technicianId: technician.id, status: 'assigned', deletedAt: null },
    }),
    prisma.request.count({
      where: {
        technicianId: technician.id,
        status: { in: ['accepted', 'in_progress', 'on_hold'] },
        deletedAt: null,
      },
    }),
    prisma.request.count({
      where: {
        technicianId: technician.id,
        status: 'completed',
        completedAt: { gte: todayStart },
        deletedAt: null,
      },
    }),
  ]);

  return {
    assigned,
    inProgress,
    completedToday,
    rating: technician.rating || 0,
  };
}

export async function getAdminStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalToday, pending, inProgress, completed, allCompleted] = await Promise.all([
    prisma.request.count({
      where: { createdAt: { gte: todayStart }, deletedAt: null },
    }),
    prisma.request.count({
      where: { status: { in: ['pending', 'rejected'] }, deletedAt: null },
    }),
    prisma.request.count({
      where: {
        status: { in: ['assigned', 'accepted', 'in_progress', 'on_hold'] },
        deletedAt: null,
      },
    }),
    prisma.request.count({
      where: { status: 'completed', completedAt: { gte: todayStart }, deletedAt: null },
    }),
    // Get completed requests with time data for average calculation
    prisma.request.findMany({
      where: {
        status: 'completed',
        startedAt: { not: null },
        completedAt: { not: null },
        deletedAt: null,
      },
      select: { startedAt: true, completedAt: true },
      take: 100,
      orderBy: { completedAt: 'desc' },
    }),
  ]);

  // Calculate average resolution time
  let avgResolutionMinutes = 0;
  if (allCompleted.length > 0) {
    const totalMinutes = allCompleted.reduce((sum, req) => {
      if (req.startedAt && req.completedAt) {
        return sum + (req.completedAt.getTime() - req.startedAt.getTime()) / 60000;
      }
      return sum;
    }, 0);
    avgResolutionMinutes = Math.round(totalMinutes / allCompleted.length);
  }

  // Format average time
  let avgResolutionTime = '-';
  if (avgResolutionMinutes > 0) {
    if (avgResolutionMinutes < 60) {
      avgResolutionTime = `${avgResolutionMinutes} นาที`;
    } else {
      const hours = Math.floor(avgResolutionMinutes / 60);
      const mins = avgResolutionMinutes % 60;
      avgResolutionTime = mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชม.`;
    }
  }

  return { totalToday, pending, inProgress, completed, avgResolutionTime };
}

export async function getRecentRequests(userId: string, role: Role, limit = 5) {
  const where: Prisma.RequestWhereInput = {
    deletedAt: null,
  };

  if (role === 'user') {
    where.userId = userId;
  }

  const technician =
    role === 'technician' ? await prisma.technician.findUnique({ where: { userId } }) : null;

  if (role === 'technician' && technician) {
    where.technicianId = technician.id;
  }

  const requests = await prisma.request.findMany({
    where,
    include: {
      category: { select: { nameTh: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    title: r.title,
    status: r.status,
    priority: r.priority,
    category: r.category.nameTh,
    createdAt: r.createdAt,
  }));
}
