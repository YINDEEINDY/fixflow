import { prisma } from '../config/db.js';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// ============ USER MANAGEMENT ============

interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  department?: string;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  role?: Role;
  isActive?: boolean;
}

export async function getUsers(params: {
  page: number;
  limit: number;
  role?: Role;
  search?: string;
  isActive?: boolean;
}) {
  const { page, limit, role, search, isActive } = params;

  const where: Prisma.UserWhereInput = {};

  if (role) where.role = role;
  if (typeof isActive === 'boolean') where.isActive = isActive;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { department: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        department: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        technician: {
          select: {
            id: true,
            specialty: true,
            isAvailable: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      department: true,
      avatarUrl: true,
      isActive: true,
      lineId: true,
      createdAt: true,
      technician: {
        select: {
          id: true,
          specialty: true,
          isAvailable: true,
          maxJobsPerDay: true,
          rating: true,
        },
      },
    },
  });

  if (!user) throw new Error('USER_NOT_FOUND');
  return user;
}

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) throw new Error('EMAIL_EXISTS');

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: hashedPassword,
      name: input.name,
      role: input.role,
      phone: input.phone,
      department: input.department,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      department: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Create technician record if role is technician
  if (input.role === 'technician') {
    await prisma.technician.create({
      data: { userId: user.id },
    });
  }

  return user;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('USER_NOT_FOUND');

  // Handle role change
  if (input.role && input.role !== user.role) {
    if (input.role === 'technician') {
      // Create technician record if becoming technician
      const existingTech = await prisma.technician.findUnique({ where: { userId: id } });
      if (!existingTech) {
        await prisma.technician.create({ data: { userId: id } });
      }
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: input,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      department: true,
      isActive: true,
      createdAt: true,
    },
  });

  return updated;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error('USER_NOT_FOUND');

  // Soft delete - just deactivate
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true };
}

// ============ CATEGORY MANAGEMENT ============

interface CategoryInput {
  name: string;
  nameTh: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createCategory(input: CategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { name: input.name },
  });

  if (existing) throw new Error('CATEGORY_EXISTS');

  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: Partial<CategoryInput> & { isActive?: boolean }) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error('CATEGORY_NOT_FOUND');

  return prisma.category.update({
    where: { id },
    data: input,
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error('CATEGORY_NOT_FOUND');

  // Check if category has requests
  const requestCount = await prisma.request.count({ where: { categoryId: id } });
  if (requestCount > 0) {
    throw new Error('CATEGORY_HAS_REQUESTS');
  }

  await prisma.category.delete({ where: { id } });
  return { success: true };
}

// ============ LOCATION MANAGEMENT ============

interface LocationInput {
  building: string;
  floor?: string;
  room?: string;
}

export async function getLocations() {
  return prisma.location.findMany({
    orderBy: [{ building: 'asc' }, { floor: 'asc' }, { room: 'asc' }],
  });
}

export async function createLocation(input: LocationInput) {
  return prisma.location.create({ data: input });
}

export async function updateLocation(id: string, input: Partial<LocationInput> & { isActive?: boolean }) {
  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) throw new Error('LOCATION_NOT_FOUND');

  return prisma.location.update({
    where: { id },
    data: input,
  });
}

export async function deleteLocation(id: string) {
  const location = await prisma.location.findUnique({ where: { id } });
  if (!location) throw new Error('LOCATION_NOT_FOUND');

  // Check if location has requests
  const requestCount = await prisma.request.count({ where: { locationId: id } });
  if (requestCount > 0) {
    throw new Error('LOCATION_HAS_REQUESTS');
  }

  await prisma.location.delete({ where: { id } });
  return { success: true };
}

// ============ REPORTS ============

export async function getReportStats(startDate?: Date, endDate?: Date) {
  const dateFilter = startDate && endDate ? {
    createdAt: { gte: startDate, lte: endDate },
  } : {};

  const [
    totalRequests,
    byStatus,
    byCategory,
    byPriority,
    topTechnicians,
  ] = await Promise.all([
    // Total requests
    prisma.request.count({ where: { ...dateFilter, deletedAt: null } }),

    // By status
    prisma.request.groupBy({
      by: ['status'],
      where: { ...dateFilter, deletedAt: null },
      _count: true,
    }),

    // By category
    prisma.request.groupBy({
      by: ['categoryId'],
      where: { ...dateFilter, deletedAt: null },
      _count: true,
    }),

    // By priority
    prisma.request.groupBy({
      by: ['priority'],
      where: { ...dateFilter, deletedAt: null },
      _count: true,
    }),

    // Top technicians by completed jobs
    prisma.request.groupBy({
      by: ['technicianId'],
      where: {
        ...dateFilter,
        status: 'completed',
        technicianId: { not: null },
        deletedAt: null,
      },
      _count: true,
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    }),
  ]);

  // Get category names
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.id, c.nameTh]));

  // Get technician names
  const technicianIds = topTechnicians.map(t => t.technicianId).filter(Boolean) as string[];
  const technicians = await prisma.technician.findMany({
    where: { id: { in: technicianIds } },
    include: { user: { select: { name: true } } },
  });
  const technicianMap = new Map(technicians.map(t => [t.id, t.user.name]));

  return {
    totalRequests,
    byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
    byCategory: byCategory.map(c => ({
      categoryId: c.categoryId,
      category: categoryMap.get(c.categoryId) || 'Unknown',
      count: c._count,
    })),
    byPriority: byPriority.map(p => ({ priority: p.priority, count: p._count })),
    topTechnicians: topTechnicians.map(t => ({
      technicianId: t.technicianId,
      name: technicianMap.get(t.technicianId!) || 'Unknown',
      completedJobs: t._count,
    })),
  };
}

export async function getMonthlyTrend(months = 6) {
  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [created, completed] = await Promise.all([
      prisma.request.count({
        where: {
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          deletedAt: null,
        },
      }),
      prisma.request.count({
        where: {
          completedAt: { gte: startOfMonth, lte: endOfMonth },
          status: 'completed',
          deletedAt: null,
        },
      }),
    ]);

    results.push({
      month: startOfMonth.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
      created,
      completed,
    });
  }

  return results;
}
