import { Router } from 'express';
import * as technicianFeedbackController from '../controllers/technician-feedback.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// Technician-specific routes
// ============================================

// Get my feedbacks (technician only)
// GET /technician-feedbacks/my
router.get(
  '/technician-feedbacks/my',
  authorize('technician'),
  technicianFeedbackController.getMyFeedbacks
);

// ============================================
// Admin-only routes
// ============================================

// Get feedback statistics
// GET /technician-feedbacks/stats
router.get(
  '/technician-feedbacks/stats',
  authorize('admin'),
  technicianFeedbackController.getStats
);

// Get all feedbacks with filters
// GET /technician-feedbacks
router.get(
  '/technician-feedbacks',
  authorize('admin'),
  technicianFeedbackController.getAllFeedbacks
);

// Get feedbacks for a specific technician
// GET /technicians/:technicianId/feedbacks
router.get(
  '/technicians/:technicianId/feedbacks',
  authorize('admin'),
  technicianFeedbackController.getTechnicianFeedbacks
);

// ============================================
// Request-specific routes
// ============================================

// Create feedback for a request (admin only)
// POST /requests/:requestId/technician-feedback
router.post(
  '/requests/:requestId/technician-feedback',
  authorize('admin'),
  technicianFeedbackController.createFeedback
);

// Get feedback for a request (admin or technician)
// GET /requests/:requestId/technician-feedback
router.get(
  '/requests/:requestId/technician-feedback',
  authorize('admin', 'technician'),
  technicianFeedbackController.getFeedbackByRequestId
);

export default router;
