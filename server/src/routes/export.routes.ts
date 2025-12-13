import { Router } from 'express';
import * as exportController from '../controllers/export.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// All export routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/excel', exportController.exportExcel);
router.get('/pdf', exportController.exportPdf);
router.get('/stats', exportController.getExportStats);

export default router;
