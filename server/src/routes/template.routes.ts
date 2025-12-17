import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import * as templateController from '../controllers/template.controller.js';

const router = Router();

// Public routes (with optional auth for user-specific templates)
router.get('/', authenticate, templateController.getTemplates);
router.get('/popular', templateController.getPopularTemplates);
router.get('/category/:categoryId', templateController.getTemplatesByCategory);
router.get('/:id', templateController.getTemplateById);

// Protected routes
router.post('/', authenticate, templateController.createTemplate);
router.post('/:id/use', authenticate, templateController.useTemplate);
router.put('/:id', authenticate, templateController.updateTemplate);
router.delete('/:id', authenticate, templateController.deleteTemplate);

export default router;
