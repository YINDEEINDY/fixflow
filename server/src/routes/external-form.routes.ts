/**
 * External Form Routes
 * Public API for Google Form and other external form integrations
 */

import { Router } from 'express';
import * as externalFormController from '../controllers/external-form.controller.js';

const router = Router();

// Public endpoints (no auth required, but API key validated in controller)
router.post('/submit', externalFormController.createFromExternalForm);
router.get('/categories', externalFormController.getCategories);
router.get('/locations', externalFormController.getLocations);

export default router;
