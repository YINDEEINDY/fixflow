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
import chatRoutes from './chat.routes.js';
import templateRoutes from './template.routes.js';
import sseRoutes from './sse.routes.js';
import technicianFeedbackRoutes from './technician-feedback.routes.js';
import externalFormRoutes from './external-form.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);
router.use('/', noteRoutes); // /requests/:id/notes
router.use('/', ratingRoutes); // /requests/:id/rating
router.use('/', technicianFeedbackRoutes); // /technician-feedbacks, /requests/:id/technician-feedback
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/profile', profileRoutes);
router.use('/upload', uploadRoutes);
router.use('/settings', settingsRoutes);
router.use('/export', exportRoutes);
router.use('/chat', chatRoutes);
router.use('/templates', templateRoutes);
router.use('/sse', sseRoutes);
router.use('/external-form', externalFormRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// LINE Bot Webhook - to capture Group ID
router.post('/line/webhook', (req, res) => {
  console.log('=== LINE Webhook Event ===');
  console.log(JSON.stringify(req.body, null, 2));

  const events = req.body.events || [];
  for (const event of events) {
    if (event.source?.groupId) {
      console.log('');
      console.log('========================================');
      console.log('GROUP ID FOUND:', event.source.groupId);
      console.log('========================================');
      console.log('');
    }
    if (event.source?.roomId) {
      console.log('ROOM ID FOUND:', event.source.roomId);
    }
    if (event.source?.userId) {
      console.log('USER ID:', event.source.userId);
    }
  }

  res.status(200).json({ status: 'ok' });
});

export default router;
