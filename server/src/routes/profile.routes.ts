import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/change-password', profileController.changePassword);
router.get('/stats', profileController.getUserStats);

export default router;
