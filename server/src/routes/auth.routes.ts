import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/line', authController.lineLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticate, authController.me);

export default router;
