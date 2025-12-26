import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for chat: 30 requests per minute
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many chat requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All chat routes require authentication
router.use(authenticate);

// POST /chat - Send message to AI
router.post('/', chatLimiter, chatController.chat);

// GET /chat/history - Get chat history
router.get('/history', chatController.getChatHistory);

// POST /chat/suggest-category - Get AI suggestion for request category
router.post('/suggest-category', chatLimiter, chatController.suggestCategory);

export default router;
