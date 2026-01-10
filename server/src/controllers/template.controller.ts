import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as templateService from '../services/template.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Get all templates
export async function getTemplates(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const templates = await templateService.getTemplates(userId);
    return sendSuccess(res, templates);
  } catch (err) {
    console.error('Get templates error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการดึงข้อมูล Template', 500);
  }
}

// Get popular templates
export async function getPopularTemplates(req: AuthRequest, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const templates = await templateService.getPopularTemplates(limit);
    return sendSuccess(res, templates);
  } catch (err) {
    console.error('Get popular templates error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการดึงข้อมูล Template', 500);
  }
}

// Get template by ID
export async function getTemplateById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const template = await templateService.getTemplateById(id);
    return sendSuccess(res, template);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'TEMPLATE_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'ไม่พบ Template', 404);
    }
    console.error('Get template error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการดึงข้อมูล Template', 500);
  }
}

// Get templates by category
export async function getTemplatesByCategory(req: AuthRequest, res: Response) {
  try {
    const { categoryId } = req.params;
    const templates = await templateService.getTemplatesByCategory(categoryId);
    return sendSuccess(res, templates);
  } catch (err) {
    console.error('Get templates by category error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการดึงข้อมูล Template', 500);
  }
}

// Create template
export async function createTemplate(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const { name, description, categoryId, title, content, priority, isPublic } = req.body;

    if (!name || !categoryId || !title) {
      return sendError(res, 'VALIDATION_ERROR', 'กรุณากรอกข้อมูลให้ครบถ้วน', 400);
    }

    const template = await templateService.createTemplate({
      name,
      description,
      categoryId,
      title,
      content,
      priority,
      isPublic,
      createdBy: userId,
    });

    return sendSuccess(res, template, 201);
  } catch (err) {
    console.error('Create template error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการสร้าง Template', 500);
  }
}

// Update template
export async function updateTemplate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return sendError(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    const template = await templateService.updateTemplate(id, userId, userRole, req.body);
    return sendSuccess(res, template);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'TEMPLATE_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'ไม่พบ Template', 404);
    }
    if (message === 'FORBIDDEN') {
      return sendError(res, 'FORBIDDEN', 'ไม่มีสิทธิ์แก้ไข Template นี้', 403);
    }
    console.error('Update template error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการแก้ไข Template', 500);
  }
}

// Delete template
export async function deleteTemplate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return sendError(res, 'UNAUTHORIZED', 'Unauthorized', 401);
    }

    await templateService.deleteTemplate(id, userId, userRole);
    return sendSuccess(res, { message: 'ลบ Template สำเร็จ' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'TEMPLATE_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'ไม่พบ Template', 404);
    }
    if (message === 'FORBIDDEN') {
      return sendError(res, 'FORBIDDEN', 'ไม่มีสิทธิ์ลบ Template นี้', 403);
    }
    console.error('Delete template error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาดในการลบ Template', 500);
  }
}

// Use template (increment usage count)
export async function useTemplate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await templateService.incrementUsageCount(id);
    const template = await templateService.getTemplateById(id);
    return sendSuccess(res, template);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message === 'TEMPLATE_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'ไม่พบ Template', 404);
    }
    console.error('Use template error:', err);
    return sendError(res, 'SERVER_ERROR', 'เกิดข้อผิดพลาด', 500);
  }
}
