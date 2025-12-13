import { Router } from 'express';
import * as ratingController from '../controllers/rating.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Get rating for a request
router.get('/requests/:requestId/rating', ratingController.getRating);

// Create rating (user only - for their own requests)
router.post('/requests/:requestId/rating', ratingController.createRating);

// Get technician ratings
router.get('/technicians/:technicianId/ratings', ratingController.getTechnicianRatings);

export default router;
