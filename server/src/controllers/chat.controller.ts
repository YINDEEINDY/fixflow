import { Response } from 'express';
import { z } from 'zod';
import * as aiService from '../services/ai.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
});

/**
 * POST /chat - Send message to AI and get response
 */
export async function chat(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      return;
    }

    const input = chatSchema.parse(req.body);

    // Get user request history for context
    const requestHistory = await aiService.getUserRequestContext(req.user.userId);

    // Build context
    const context: aiService.ChatContext = {
      userId: req.user.userId,
      userRole: req.user.role,
      requestHistory,
    };

    // Save user message
    await aiService.saveChatMessage(req.user.userId, 'user', input.message);

    // Chat with AI
    const response = await aiService.chatWithAI(input.message, context);

    // Save assistant response
    await aiService.saveChatMessage(req.user.userId, 'assistant', response.message);

    sendSuccess(res, {
      message: {
        id: `msg-${Date.now()}`,
        content: response.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    if (error instanceof Error) {
      if (error.message === 'AI_NOT_CONFIGURED') {
        sendError(
          res,
          'AI_NOT_CONFIGURED',
          'AI service is not configured. Please contact administrator.',
          503
        );
        return;
      }
      if (error.message === 'AI_SERVICE_ERROR') {
        sendError(
          res,
          'AI_SERVICE_ERROR',
          'AI service encountered an error. Please try again later.',
          500
        );
        return;
      }
    }

    throw error;
  }
}

/**
 * GET /chat/history - Get chat history
 */
export async function getChatHistory(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
    return;
  }

  const messages = await aiService.getChatHistory(req.user.userId);

  sendSuccess(res, {
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      timestamp: m.createdAt.toISOString(),
    })),
  });
}

const suggestCategorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
});

/**
 * POST /chat/suggest-category - Get AI suggestion for request category
 */
export async function suggestCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401);
      return;
    }

    const input = suggestCategorySchema.parse(req.body);

    const suggestion = await aiService.suggestCategory({
      title: input.title,
      description: input.description,
    });

    if (!suggestion) {
      sendError(res, 'NO_SUGGESTION', 'Could not generate category suggestion', 404);
      return;
    }

    sendSuccess(res, { suggestion });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      sendError(res, 'VALIDATION_ERROR', 'Validation failed', 400, details);
      return;
    }

    if (error instanceof Error) {
      if (error.message === 'AI_NOT_CONFIGURED') {
        sendError(
          res,
          'AI_NOT_CONFIGURED',
          'AI service is not configured. Please contact administrator.',
          503
        );
        return;
      }
      if (error.message === 'AI_SERVICE_ERROR') {
        sendError(
          res,
          'AI_SERVICE_ERROR',
          'AI service encountered an error. Please try again later.',
          500
        );
        return;
      }
    }

    throw error;
  }
}
