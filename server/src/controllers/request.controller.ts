import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as requestService from '../services/request.service.js';
import { RequestStatus, Priority } from '@prisma/client';

export async function createRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const {
      categoryId,
      locationId,
      title,
      description,
      photos,
      priority,
      preferredDate,
      preferredTime,
    } = req.body;

    if (!categoryId || !locationId || !title) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'categoryId, locationId, and title are required',
        },
      });
    }

    const request = await requestService.createRequest({
      userId,
      categoryId,
      locationId,
      title,
      description,
      photos,
      priority,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime,
    });

    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create request' },
    });
  }
}

export async function getRequests(req: AuthRequest, res: Response) {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      priority,
      categoryId,
      locationId,
      userId,
      technicianId,
      search,
      sortBy,
      sortOrder,
    } = req.query;

    const result = await requestService.getRequests({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      status: status as RequestStatus | undefined,
      priority: priority as Priority | undefined,
      categoryId: categoryId as string | undefined,
      locationId: locationId as string | undefined,
      userId: userId as string | undefined,
      technicianId: technicianId as string | undefined,
      search: search as string | undefined,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get requests error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get requests' },
    });
  }
}

export async function getMyRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const { page = '1', limit = '10', status, sortBy, sortOrder } = req.query;

    const result = await requestService.getRequests({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      userId,
      status: status as RequestStatus | undefined,
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get my requests error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get requests' },
    });
  }
}

export async function getRequestById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const request = await requestService.getRequestById(id, userId, userRole);
    return res.json({ success: true, data: request });
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
          error: { code: 'FORBIDDEN', message: 'You do not have permission to view this request' },
        });
      }
    }
    console.error('Get request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get request' },
    });
  }
}

export async function updateRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description, photos, priority, preferredDate, preferredTime } = req.body;

    const request = await requestService.updateRequest(id, userId, {
      title,
      description,
      photos,
      priority,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime,
    });

    return res.json({ success: true, data: request });
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
          error: { code: 'FORBIDDEN', message: 'You can only update your own requests' },
        });
      }
      if (error.message === 'CANNOT_UPDATE') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_UPDATE', message: 'Cannot update request in current status' },
        });
      }
    }
    console.error('Update request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update request' },
    });
  }
}

export async function cancelRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { reason } = req.body;

    const request = await requestService.cancelRequest(id, userId, reason);
    return res.json({ success: true, data: request });
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
          error: { code: 'FORBIDDEN', message: 'You can only cancel your own requests' },
        });
      }
      if (error.message === 'CANNOT_CANCEL') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_CANCEL', message: 'Cannot cancel request in current status' },
        });
      }
    }
    console.error('Cancel request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to cancel request' },
    });
  }
}

export async function assignRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;
    const { technicianId, note } = req.body;

    if (!technicianId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'technicianId is required' },
      });
    }

    const request = await requestService.assignRequest(id, technicianId, adminId, note);
    return res.json({ success: true, data: request });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'REQUEST_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Request not found' },
        });
      }
      if (error.message === 'TECHNICIAN_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Technician not found' },
        });
      }
      if (error.message === 'CANNOT_ASSIGN') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_ASSIGN', message: 'Cannot assign request in current status' },
        });
      }
    }
    console.error('Assign request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to assign request' },
    });
  }
}

export async function acceptRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const technicianUserId = req.user!.userId;

    const request = await requestService.acceptRequest(id, technicianUserId);
    return res.json({ success: true, data: request });
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
      if (error.message === 'CANNOT_ACCEPT') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_ACCEPT', message: 'Cannot accept request in current status' },
        });
      }
    }
    console.error('Accept request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to accept request' },
    });
  }
}

export async function rejectRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const technicianUserId = req.user!.userId;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'reason is required' },
      });
    }

    const request = await requestService.rejectRequest(id, technicianUserId, reason);
    return res.json({ success: true, data: request });
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
      if (error.message === 'CANNOT_REJECT') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_REJECT', message: 'Cannot reject request in current status' },
        });
      }
    }
    console.error('Reject request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to reject request' },
    });
  }
}

export async function startRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const technicianUserId = req.user!.userId;

    const request = await requestService.startRequest(id, technicianUserId);
    return res.json({ success: true, data: request });
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
      if (error.message === 'CANNOT_START') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_START', message: 'Cannot start request in current status' },
        });
      }
    }
    console.error('Start request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to start request' },
    });
  }
}

export async function completeRequest(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const technicianUserId = req.user!.userId;
    const { note } = req.body;

    const request = await requestService.completeRequest(id, technicianUserId, note);
    return res.json({ success: true, data: request });
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
      if (error.message === 'CANNOT_COMPLETE') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_COMPLETE', message: 'Cannot complete request in current status' },
        });
      }
    }
    console.error('Complete request error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to complete request' },
    });
  }
}

export async function getCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await requestService.getCategories();
    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get categories' },
    });
  }
}

export async function getLocations(_req: AuthRequest, res: Response) {
  try {
    const locations = await requestService.getLocations();
    return res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Get locations error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get locations' },
    });
  }
}

export async function getTechnicians(_req: AuthRequest, res: Response) {
  try {
    const technicians = await requestService.getTechnicians();
    return res.json({ success: true, data: technicians });
  } catch (error) {
    console.error('Get technicians error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get technicians' },
    });
  }
}
