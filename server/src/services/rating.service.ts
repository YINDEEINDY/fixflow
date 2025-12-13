import { prisma } from '../config/db.js';

interface CreateRatingInput {
  requestId: string;
  userId: string;
  score: number;
  comment?: string;
}

export async function createRating(input: CreateRatingInput) {
  const request = await prisma.request.findUnique({
    where: { id: input.requestId },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.userId !== input.userId) {
    throw new Error('FORBIDDEN');
  }

  if (request.status !== 'completed') {
    throw new Error('CANNOT_RATE');
  }

  // Check if already rated
  const existingRating = await prisma.rating.findUnique({
    where: { requestId: input.requestId },
  });

  if (existingRating) {
    throw new Error('ALREADY_RATED');
  }

  if (input.score < 1 || input.score > 5) {
    throw new Error('INVALID_SCORE');
  }

  const rating = await prisma.rating.create({
    data: {
      requestId: input.requestId,
      userId: input.userId,
      score: input.score,
      comment: input.comment,
    },
  });

  // Update technician average rating
  if (request.technicianId) {
    const ratings = await prisma.rating.findMany({
      where: {
        request: {
          technicianId: request.technicianId,
        },
      },
    });

    const avgRating = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

    await prisma.technician.update({
      where: { id: request.technicianId },
      data: { rating: avgRating },
    });
  }

  return rating;
}

export async function getRatingByRequestId(requestId: string) {
  const rating = await prisma.rating.findUnique({
    where: { requestId },
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

  return rating;
}

export async function getTechnicianRatings(technicianId: string) {
  const ratings = await prisma.rating.findMany({
    where: {
      request: {
        technicianId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
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
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return ratings;
}
