import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All settings routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/test-discord', settingsController.testDiscord);
router.post('/test-discord-bot', settingsController.testDiscordBot);
router.get('/discord-channels', settingsController.getDiscordChannels);
router.post('/test-line-bot', settingsController.testLineBot);
router.post('/test-all-notifications', settingsController.testAllNotifications);

export default router;
