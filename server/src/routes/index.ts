import { Router } from 'express';
import authRoutes from './auth.routes.js';
import requestRoutes from './request.routes.js';
import noteRoutes from './note.routes.js';
import ratingRoutes from './rating.routes.js';
import notificationRoutes from './notification.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import adminRoutes from './admin.routes.js';
import profileRoutes from './profile.routes.js';
import uploadRoutes from './upload.routes.js';
import settingsRoutes from './settings.routes.js';
import exportRoutes from './export.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/', noteRoutes); // /requests/:id/notes
router.use('/', ratingRoutes); // /requests/:id/rating
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/profile', profileRoutes);
router.use('/upload', uploadRoutes);
router.use('/settings', settingsRoutes);
router.use('/export', exportRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
