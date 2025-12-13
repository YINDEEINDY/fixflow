import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as ratingService from '../services/rating.service.js';

export async function createRating(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const userId = req.user!.userId;
    const { score, comment } = req.body;

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'score must be between 1 and 5' },
      });
    }

    const rating = await ratingService.createRating({
      requestId,
      userId,
      score,
      comment,
    });

    return res.status(201).json({ success: true, data: rating });
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
          error: { code: 'FORBIDDEN', message: 'You can only rate your own requests' },
        });
      }
      if (error.message === 'CANNOT_RATE') {
        return res.status(400).json({
          success: false,
          error: { code: 'CANNOT_RATE', message: 'Can only rate completed requests' },
        });
      }
      if (error.message === 'ALREADY_RATED') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_RATED', message: 'Request already rated' },
        });
      }
      if (error.message === 'INVALID_SCORE') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_SCORE', message: 'Score must be between 1 and 5' },
        });
      }
    }
    console.error('Create rating error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create rating' },
    });
  }
}

export async function getRating(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const rating = await ratingService.getRatingByRequestId(requestId);
    return res.json({ success: true, data: rating });
  } catch (error) {
    console.error('Get rating error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get rating' },
    });
  }
}

export async function getTechnicianRatings(req: AuthRequest, res: Response) {
  try {
    const { technicianId } = req.params;
    const ratings = await ratingService.getTechnicianRatings(technicianId);
    return res.json({ success: true, data: ratings });
  } catch (error) {
    console.error('Get technician ratings error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get ratings' },
    });
  }
}
