import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as noteService from '../services/note.service.js';
import { prisma } from '../config/db.js';

export async function createNote(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const userId = req.user!.userId;
    const { note, photos, materials, timeSpentMinutes } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'note is required' },
      });
    }

    // Get technician ID from user ID
    const technician = await prisma.technician.findUnique({
      where: { userId },
    });

    if (!technician) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only technicians can add notes' },
      });
    }

    const jobNote = await noteService.createNote({
      requestId,
      technicianId: technician.id,
      note,
      photos,
      materials,
      timeSpentMinutes,
    });

    return res.status(201).json({ success: true, data: jobNote });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Request not found' },
        });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not assigned to this request' },
        });
      }
      if (error.message === 'CANNOT_ADD_NOTE') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_ADD_NOTE', message: 'Cannot add note in current status' },
        });
      }
    }
    console.error('Create note error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create note' },
    });
  }
}

export async function getNotes(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const notes = await noteService.getNotesByRequestId(requestId);
    return res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get notes' },
    });
  }
}

export async function deleteNote(req: AuthRequest, res: Response) {
  try {
    const { noteId } = req.params;
    const userId = req.user!.userId;

    const technician = await prisma.technician.findUnique({
      where: { userId },
    });

    if (!technician) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only technicians can delete notes' },
      });
    }

    await noteService.deleteNote(noteId, technician.id);
    return res.json({ success: true, data: { message: 'Note deleted' } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'NOTE_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Note not found' },
        });
      }
      if (error.message === 'FORBIDDEN') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You can only delete your own notes' },
        });
      }
    }
    console.error('Delete note error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete note' },
    });
  }
}
