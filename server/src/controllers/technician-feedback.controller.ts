import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as technicianFeedbackService from '../services/technician-feedback.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Create feedback for a technician on a completed request
 * POST /requests/:requestId/technician-feedback
 */
export async function createFeedback(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const adminId = req.user!.userId;
    const { technicianId, score, comment } = req.body;

    // Validate required fields
    if (!technicianId) {
      return sendError(res, 'VALIDATION_ERROR', 'technicianId is required', 400);
    }

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return sendError(
        res,
        'VALIDATION_ERROR',
        'score must be a number between 1 and 5',
        400
      );
    }

    const feedback = await technicianFeedbackService.createFeedback({
      technicianId,
      requestId,
      adminId,
      score,
      comment,
    });

    return sendSuccess(res, feedback, 201);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'INVALID_SCORE':
          return sendError(res, 'INVALID_SCORE', 'Score must be between 1 and 5', 400);
        case 'REQUEST_NOT_FOUND':
          return sendError(res, 'NOT_FOUND', 'Request not found', 404);
        case 'REQUEST_NOT_COMPLETED':
          return sendError(
            res,
            'REQUEST_NOT_COMPLETED',
            'Can only give feedback for completed requests',
            400
          );
        case 'NO_TECHNICIAN_ASSIGNED':
          return sendError(
            res,
            'NO_TECHNICIAN_ASSIGNED',
            'No technician assigned to this request',
            400
          );
        case 'TECHNICIAN_MISMATCH':
          return sendError(
            res,
            'TECHNICIAN_MISMATCH',
            'Technician ID does not match the assigned technician',
            400
          );
        case 'FEEDBACK_ALREADY_EXISTS':
          return sendError(
            res,
            'FEEDBACK_ALREADY_EXISTS',
            'Feedback already exists for this request',
            400
          );
      }
    }
    console.error('Create technician feedback error:', error);
    return sendError(res, 'SERVER_ERROR', 'Failed to create feedback', 500);
  }
}

/**
 * Get feedback for a specific request
 * GET /requests/:requestId/technician-feedback
 */
export async function getFeedbackByRequestId(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const feedback = await technicianFeedbackService.getFeedbackByRequestId(requestId);
    return sendSuccess(res, feedback);
  } catch (error) {
    console.error('Get feedback by request ID error:', error);
    return sendError(res, 'SERVER_ERROR', 'Failed to get feedback', 500);
  }
}

/**
 * Get feedbacks for the logged-in technician
 * GET /technician-feedbacks/my
 */
export async function getMyFeedbacks(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await technicianFeedbackService.getMyFeedbacks(userId, {
      page,
      limit,
    });

    return sendSuccess(res, result);
  } catch (error) {
    if (error instanceof Error && error.message === 'TECHNICIAN_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'Technician profile not found', 404);
    }
    console.error('Get my feedbacks error:', error);
    return sendError(res, 'SERVER_ERROR', 'Failed to get feedbacks', 500);
  }
}

/**
 * Get feedbacks for a specific technician (admin only)
 * GET /technicians/:technicianId/feedbacks
 */
export async function getTechnicianFeedbacks(req: AuthRequest, res: Response) {
  try {
    const { technicianId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await technicianFeedbackService.getTechnicianFeedbacks(
      technicianId,
      { page, limit }
    );

    return sendSuccess(res, result);
  } catch (error) {
    console.error('Get technician feedbacks error:', error);
    return sendError(res, 'SERVER_ERROR', 'Failed to get feedbacks', 500);
  }
}

/**
 * Get all feedbacks with filters (admin only)
 * GET /technician-feedbacks
 */
export async function getAllFeedbacks(req: AuthRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const technicianId = req.query.technicianId as string | undefined;
    const adminId = req.query.adminId as string | undefined;
    const minScore = req.query.minScore
      ? parseInt(req.query.minScore as string)
      : undefined;
    const maxScore = req.query.maxScore
      ? parseInt(req.query.maxScore as string)
      : undefined;

    const result = await technicianFeedbackService.getAllFeedbacks({
      page,
      limit,
      technicianId,
      adminId,
      minScore,
      maxScore,
    });

    return sendSuccess(res, result);
  } catch (error) {
    console.error('Get all feedbacks error:', error);
    return sendError(res, 'SERVER_ERROR', 'Failed to get feedbacks', 500);
  }
}

/**
 * Get overall feedback statistics (admin only)
 * GET /technician-feedbacks/stats
 */
export async function getStats(_req: AuthRequest, res: Response) {
  try {
    const stats = await technicianFeedbackService.getStats();
    return sendSuccess(res, stats);
  } catch (error) {
    console.error('Get feedback stats error:', error);
    return sendError(res, 'SERVER_ERROR', 'Failed to get statistics', 500);
  }
}
