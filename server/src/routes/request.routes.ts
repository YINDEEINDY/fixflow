import { Router } from 'express';
import * as requestController from '../controllers/request.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public routes (still require auth for creating requests)
router.get('/categories', requestController.getCategories);
router.get('/locations', requestController.getLocations);

// Protected routes - require authentication
router.use(authenticate);

// Admin routes (must be before /:id to avoid route conflicts)
router.get('/', authorize('admin'), requestController.getRequests);
router.get('/technicians', authorize('admin'), requestController.getTechnicians);

// User routes
router.post('/', requestController.createRequest);
router.get('/my', requestController.getMyRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id', requestController.updateRequest);
router.post('/:id/cancel', requestController.cancelRequest);

// Admin action routes
router.post('/:id/assign', authorize('admin'), requestController.assignRequest);

// Technician routes
router.post('/:id/accept', authorize('technician', 'admin'), requestController.acceptRequest);
router.post('/:id/reject', authorize('technician', 'admin'), requestController.rejectRequest);
router.post('/:id/start', authorize('technician', 'admin'), requestController.startRequest);
router.post('/:id/complete', authorize('technician', 'admin'), requestController.completeRequest);

export default router;
