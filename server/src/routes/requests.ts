import { Router } from 'express';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  getKPIMetrics
} from '../controllers/requestController';

const router = Router();

// Metrics endpoint (must come before /:id to avoid conflicts)
router.get('/metrics/kpi', getKPIMetrics);

// Request endpoints
router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.patch('/:id', updateRequest);
router.delete('/:id', deleteRequest);

export default router;
