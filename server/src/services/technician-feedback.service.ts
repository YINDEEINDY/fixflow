import { prisma } from '../config/db.js';

interface CreateFeedbackInput {
  technicianId: string;
  requestId: string;
  adminId: string;
  score: number;
  comment?: string;
}

interface GetFeedbacksOptions {
  page?: number;
  limit?: number;
  technicianId?: string;
  adminId?: string;
  minScore?: number;
  maxScore?: number;
}

/**
 * Create feedback for a technician on a completed request
 */
export async function createFeedback(input: CreateFeedbackInput) {
  // Validate score range
  if (input.score < 1 || input.score > 5) {
    throw new Error('INVALID_SCORE');
  }

  // Check if request exists and is completed
  const request = await prisma.request.findUnique({
    where: { id: input.requestId },
    include: { technician: true },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.status !== 'completed') {
    throw new Error('REQUEST_NOT_COMPLETED');
  }

  if (!request.technicianId) {
    throw new Error('NO_TECHNICIAN_ASSIGNED');
  }

  // Verify technician matches
  if (request.technicianId !== input.technicianId) {
    throw new Error('TECHNICIAN_MISMATCH');
  }

  // Check if feedback already exists for this request
  const existingFeedback = await prisma.technicianFeedback.findUnique({
    where: { requestId: input.requestId },
  });

  if (existingFeedback) {
    throw new Error('FEEDBACK_ALREADY_EXISTS');
  }

  // Create the feedback
  const feedback = await prisma.technicianFeedback.create({
    data: {
      technicianId: input.technicianId,
      requestId: input.requestId,
      adminId: input.adminId,
      score: input.score,
      comment: input.comment,
    },
    include: {
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
      request: {
        select: {
          id: true,
          requestNumber: true,
          title: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Update technician's average feedback score
  await updateTechnicianAverageScore(input.technicianId);

  return feedback;
}

/**
 * Get feedback for a specific request
 */
export async function getFeedbackByRequestId(requestId: string) {
  const feedback = await prisma.technicianFeedback.findUnique({
    where: { requestId },
    include: {
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
      request: {
        select: {
          id: true,
          requestNumber: true,
          title: true,
        },
      },
      admin: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return feedback;
}

/**
 * Get feedbacks for a technician (by technicianId from Technician table)
 */
export async function getTechnicianFeedbacks(
  technicianId: string,
  options: { page?: number; limit?: number } = {}
) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const [feedbacks, total] = await Promise.all([
    prisma.technicianFeedback.findMany({
      where: { technicianId },
      include: {
        request: {
          select: {
            id: true,
            requestNumber: true,
            title: true,
            completedAt: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.technicianFeedback.count({
      where: { technicianId },
    }),
  ]);

  return {
    items: feedbacks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get feedbacks for the logged-in technician (by userId)
 */
export async function getMyFeedbacks(
  userId: string,
  options: { page?: number; limit?: number } = {}
) {
  // Find technician by userId
  const technician = await prisma.technician.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new Error('TECHNICIAN_NOT_FOUND');
  }

  return getTechnicianFeedbacks(technician.id, options);
}

/**
 * Get all feedbacks with filters (admin only)
 */
export async function getAllFeedbacks(options: GetFeedbacksOptions = {}) {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    technicianId?: string;
    adminId?: string;
    score?: { gte?: number; lte?: number };
  } = {};

  if (options.technicianId) {
    where.technicianId = options.technicianId;
  }

  if (options.adminId) {
    where.adminId = options.adminId;
  }

  if (options.minScore !== undefined || options.maxScore !== undefined) {
    where.score = {};
    if (options.minScore !== undefined) {
      where.score.gte = options.minScore;
    }
    if (options.maxScore !== undefined) {
      where.score.lte = options.maxScore;
    }
  }

  const [feedbacks, total] = await Promise.all([
    prisma.technicianFeedback.findMany({
      where,
      include: {
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
        request: {
          select: {
            id: true,
            requestNumber: true,
            title: true,
            completedAt: true,
          },
        },
        admin: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.technicianFeedback.count({ where }),
  ]);

  return {
    items: feedbacks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get overall feedback statistics
 */
export async function getStats() {
  const [
    totalFeedbacks,
    scoreDistribution,
    averageScore,
    recentFeedbacks,
    topTechnicians,
  ] = await Promise.all([
    // Total feedbacks count
    prisma.technicianFeedback.count(),

    // Score distribution (1-5)
    prisma.technicianFeedback.groupBy({
      by: ['score'],
      _count: true,
      orderBy: { score: 'asc' },
    }),

    // Average score
    prisma.technicianFeedback.aggregate({
      _avg: { score: true },
    }),

    // Recent feedbacks (last 5)
    prisma.technicianFeedback.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
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
        request: {
          select: {
            id: true,
            requestNumber: true,
            title: true,
          },
        },
      },
    }),

    // Top 5 technicians by average feedback score
    prisma.technicianFeedback.groupBy({
      by: ['technicianId'],
      _avg: { score: true },
      _count: true,
      orderBy: { _avg: { score: 'desc' } },
      take: 5,
    }),
  ]);

  // Get technician details for top technicians
  const technicianIds = topTechnicians.map((t) => t.technicianId);
  const technicians = await prisma.technician.findMany({
    where: { id: { in: technicianIds } },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  const technicianMap = new Map(technicians.map((t) => [t.id, t]));

  const topTechniciansWithDetails = topTechnicians.map((t) => ({
    technician: technicianMap.get(t.technicianId),
    averageScore: t._avg.score,
    feedbackCount: t._count,
  }));

  // Format score distribution as an object { 1: count, 2: count, ... }
  const scoreDistributionFormatted: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  scoreDistribution.forEach((item) => {
    scoreDistributionFormatted[item.score] = item._count;
  });

  return {
    totalFeedbacks,
    averageScore: averageScore._avg.score || 0,
    scoreDistribution: scoreDistributionFormatted,
    recentFeedbacks,
    topTechnicians: topTechniciansWithDetails,
  };
}

/**
 * Helper function to update technician's average feedback score
 */
async function updateTechnicianAverageScore(technicianId: string) {
  const result = await prisma.technicianFeedback.aggregate({
    where: { technicianId },
    _avg: { score: true },
  });

  if (result._avg.score !== null) {
    await prisma.technician.update({
      where: { id: technicianId },
      data: { rating: result._avg.score },
    });
  }
}
