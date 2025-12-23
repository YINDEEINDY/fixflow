import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Public routes with rate limiting
router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/line', loginLimiter, authController.lineLogin);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/verify-reset-token', authController.verifyResetToken);
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);

// Protected routes
router.get('/me', authenticate, authController.me);

export default router;
