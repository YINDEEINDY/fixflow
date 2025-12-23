import { prisma } from '../config/db.js';

interface CreateNoteInput {
  requestId: string;
  technicianId: string;
  note: string;
  photos?: string[];
  materials?: Record<string, unknown>;
  timeSpentMinutes?: number;
}

export async function createNote(input: CreateNoteInput) {
  const request = await prisma.request.findUnique({
    where: { id: input.requestId },
    include: { technician: true },
  });

  if (!request || request.deletedAt) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  if (request.technician?.id !== input.technicianId) {
    throw new Error('FORBIDDEN');
  }

  if (!['in_progress', 'on_hold'].includes(request.status)) {
    throw new Error('CANNOT_ADD_NOTE');
  }

  const note = await prisma.jobNote.create({
    data: {
      requestId: input.requestId,
      technicianId: input.technicianId,
      note: input.note,
      photos: input.photos || [],
      materials: (input.materials as object) || {},
      timeSpentMinutes: input.timeSpentMinutes,
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
    },
  });

  return note;
}

export async function getNotesByRequestId(requestId: string) {
  const notes = await prisma.jobNote.findMany({
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
    },
    orderBy: { createdAt: 'desc' },
  });

  return notes;
}

export async function deleteNote(noteId: string, technicianId: string) {
  const note = await prisma.jobNote.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new Error('NOTE_NOT_FOUND');
  }

  if (note.technicianId !== technicianId) {
    throw new Error('FORBIDDEN');
  }

  await prisma.jobNote.delete({
    where: { id: noteId },
  });

  return { success: true };
}
