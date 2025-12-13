import { prisma } from '../config/db.js';
import { RequestStatus, Priority, Prisma } from '@prisma/client';
import * as discordNotify from './discord-notify.service.js';

interface CreateRequestInput {
  userId: string;
  categoryId: string;
  locationId: string;
  title: string;
  description?: string;
  photos?: string[];
  priority?: Priority;
  preferredDate?: Date;
  preferredTime?: string;
}

interface UpdateRequestInput {
  title?: string;
  description?: string;
  photos?: string[];
  priority?: Priority;
  preferredDate?: Date;
  preferredTime?: string;
}

interface ListRequestsParams {
  page: number;
  limit: number;
  status?: RequestStatus;
  priority?: Priority;
  categoryId?: string;
  locationId?: string;
  userId?: string;
  technicianId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Generate request number: REQ-YYYYMMDD-XXXX
async function generateRequestNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `REQ-${dateStr}-`;

  // Find the latest request number for today
  const latestRequest = await prisma.request.findFirst({
    where: {
      requestNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      requestNumber: 'desc',
    },
    select: {
      requestNumber: true,
    },
  });

  let sequence = 1;
  if (latestRequest) {
    const lastSequence = parseInt(latestRequest.requestNumber.slice(-4), 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`;
}

export async function createRequest(input: CreateRequestInput) {
  const requestNumber = await generateRequestNumber();

  const request = await prisma.request.create({
    data: {
      requestNumber,
      userId: input.userId,
      categoryId: input.categoryId,
      locationId: input.locationId,
      title: input.title,
      description: input.description,
      photos: input.photos || [],
      priority: input.priority || 'normal',
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      status: 'pending',
    },
    include: {
      category: true,
      location: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Create log
  await prisma.requestLog.create({
    data: {
      requestId: request.id,
      action: 'created',
      newStatus: 'pending',
      createdBy: input.userId,
    },
  });

  // Send Discord notification
  const location = request.location;
  const locationStr = `${location.building}${location.floor ? ` ชั้น ${location.floor}` : ''}${location.room ? ` ห้อง ${location.room}` : ''}`;

  discordNotify.notifyNewRequest({
    requestNumber: request.requestNumber,
    title: request.title,
    category: request.category.nameTh,
    location: locationStr,
    priority: request.priority,
    userName: request.user.name,
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return request;
}

export async function getRequests(params: ListRequestsParams) {
  const {
    page,
    limit,
    status,
    priority,
    categoryId,
    locationId,
    userId,
    technicianId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  const where: Prisma.RequestWhereInput = {
    deletedAt: null,
  };

  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (categoryId) where.categoryId = categoryId;
  if (locationId) where.locationId = locationId;
  if (userId) where.userId = userId;
  if (technicianId) where.technicianId = technicianId;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { requestNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.request.findMany({
      where,
      include: {
        category: true,
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        technician: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.request.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getRequestById(id: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
          avatarUrl: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      },
      logs: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      notes: {
        include: {
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      rating: true,
    },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  return request;
}

export async function updateRequest(id: string, userId: string, input: UpdateRequestInput) {
  const request = await prisma.request.findUnique({ where: { id } });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.userId !== userId) {
    throw new Error('FORBIDDEN');
  }

  if (!['pending', 'assigned'].includes(request.status)) {
    throw new Error('CANNOT_UPDATE');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: {
      ...input,
      updatedAt: new Date(),
    },
    include: {
      category: true,
      location: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'updated',
      note: 'Request details updated',
      createdBy: userId,
    },
  });

  return updated;
}

export async function cancelRequest(id: string, userId: string, reason?: string) {
  const request = await prisma.request.findUnique({ where: { id } });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.userId !== userId) {
    throw new Error('FORBIDDEN');
  }

  if (!['pending', 'assigned'].includes(request.status)) {
    throw new Error('CANNOT_CANCEL');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: {
      status: 'cancelled',
      deletedAt: new Date(),
    },
    include: {
      category: true,
      location: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
          avatarUrl: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'cancelled',
      oldStatus: request.status,
      newStatus: 'cancelled',
      note: reason,
      createdBy: userId,
    },
  });

  // Send Discord notification
  discordNotify.notifyRequestCancelled({
    requestNumber: updated.requestNumber,
    title: updated.title,
    userName: updated.user.name,
    reason,
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return updated;
}

export async function assignRequest(id: string, technicianId: string, adminId: string, note?: string) {
  const request = await prisma.request.findUnique({ where: { id } });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (!['pending', 'rejected'].includes(request.status)) {
    throw new Error('CANNOT_ASSIGN');
  }

  const technician = await prisma.technician.findUnique({ where: { id: technicianId } });
  if (!technician) {
    throw new Error('TECHNICIAN_NOT_FOUND');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: {
      technicianId,
      status: 'assigned',
      assignedAt: new Date(),
    },
    include: {
      category: true,
      location: true,
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'assigned',
      oldStatus: request.status,
      newStatus: 'assigned',
      note,
      createdBy: adminId,
    },
  });

  // Send Discord notification
  discordNotify.notifyRequestAssigned({
    requestNumber: request.requestNumber,
    title: request.title,
    technicianName: updated.technician?.user.name || 'ไม่ระบุ',
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return updated;
}

export async function acceptRequest(id: string, technicianUserId: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      technician: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.status !== 'assigned') {
    throw new Error('CANNOT_ACCEPT');
  }

  if (request.technician?.userId !== technicianUserId) {
    throw new Error('FORBIDDEN');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: { status: 'accepted' },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'accepted',
      oldStatus: 'assigned',
      newStatus: 'accepted',
      createdBy: technicianUserId,
    },
  });

  // Send Discord notification
  discordNotify.notifyRequestAccepted({
    requestNumber: request.requestNumber,
    title: request.title,
    technicianName: request.technician?.user?.name || 'ไม่ระบุ',
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return updated;
}

export async function rejectRequest(id: string, technicianUserId: string, reason: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      technician: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.status !== 'assigned') {
    throw new Error('CANNOT_REJECT');
  }

  if (request.technician?.userId !== technicianUserId) {
    throw new Error('FORBIDDEN');
  }

  const technicianName = request.technician?.user?.name || 'ไม่ระบุ';

  const updated = await prisma.request.update({
    where: { id },
    data: {
      status: 'rejected',
      technicianId: null,
      assignedAt: null,
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'rejected',
      oldStatus: 'assigned',
      newStatus: 'rejected',
      note: reason,
      createdBy: technicianUserId,
    },
  });

  // Send Discord notification
  discordNotify.notifyRequestRejected({
    requestNumber: request.requestNumber,
    title: request.title,
    technicianName,
    reason,
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return updated;
}

export async function startRequest(id: string, technicianUserId: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      technician: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.status !== 'accepted') {
    throw new Error('CANNOT_START');
  }

  if (request.technician?.userId !== technicianUserId) {
    throw new Error('FORBIDDEN');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: {
      status: 'in_progress',
      startedAt: new Date(),
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'started',
      oldStatus: 'accepted',
      newStatus: 'in_progress',
      createdBy: technicianUserId,
    },
  });

  // Send Discord notification
  discordNotify.notifyRequestStarted({
    requestNumber: request.requestNumber,
    title: request.title,
    technicianName: request.technician?.user?.name || 'ไม่ระบุ',
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return updated;
}

export async function completeRequest(id: string, technicianUserId: string, note?: string) {
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      technician: {
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (!['in_progress', 'on_hold'].includes(request.status)) {
    throw new Error('CANNOT_COMPLETE');
  }

  if (request.technician?.userId !== technicianUserId) {
    throw new Error('FORBIDDEN');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  await prisma.requestLog.create({
    data: {
      requestId: id,
      action: 'completed',
      oldStatus: request.status,
      newStatus: 'completed',
      note,
      createdBy: technicianUserId,
    },
  });

  // Send Discord notification
  discordNotify.notifyRequestCompleted({
    requestNumber: request.requestNumber,
    title: request.title,
    technicianName: request.technician?.user?.name || 'ไม่ระบุ',
    note,
  }).catch((err) => console.error('Failed to send Discord notify:', err));

  return updated;
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getLocations() {
  return prisma.location.findMany({
    where: { isActive: true },
    orderBy: [{ building: 'asc' }, { floor: 'asc' }, { room: 'asc' }],
  });
}

export async function getTechnicians() {
  return prisma.technician.findMany({
    where: { isAvailable: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
  });
}
