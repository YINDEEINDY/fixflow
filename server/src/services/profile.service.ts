import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  department?: string;
  avatarUrl?: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      department: true,
      avatarUrl: true,
      lineId: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
      department: input.department,
      avatarUrl: input.avatarUrl,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      department: true,
      avatarUrl: true,
      lineId: true,
      isActive: true,
      createdAt: true,
    },
  });

  return updated;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (!user.passwordHash) {
    throw new Error('NO_PASSWORD_SET');
  }

  const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('INVALID_CURRENT_PASSWORD');
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  return { success: true };
}

export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { technician: true },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.role === 'technician' && user.technician) {
    const [totalJobs, completedJobs, inProgressJobs] = await Promise.all([
      prisma.request.count({
        where: { technicianId: user.technician.id, deletedAt: null },
      }),
      prisma.request.count({
        where: { technicianId: user.technician.id, status: 'completed', deletedAt: null },
      }),
      prisma.request.count({
        where: { technicianId: user.technician.id, status: 'in_progress', deletedAt: null },
      }),
    ]);

    return {
      totalJobs,
      completedJobs,
      inProgressJobs,
      rating: user.technician.rating,
      specialty: user.technician.specialty,
    };
  }

  // For regular users
  const [totalRequests, pendingRequests, completedRequests] = await Promise.all([
    prisma.request.count({
      where: { userId, deletedAt: null },
    }),
    prisma.request.count({
      where: { userId, status: 'pending', deletedAt: null },
    }),
    prisma.request.count({
      where: { userId, status: 'completed', deletedAt: null },
    }),
  ]);

  return {
    totalRequests,
    pendingRequests,
    completedRequests,
  };
}
