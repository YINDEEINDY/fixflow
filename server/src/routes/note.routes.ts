import { Router } from 'express';
import * as noteController from '../controllers/note.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

// Get notes for a request
router.get('/requests/:requestId/notes', noteController.getNotes);

// Create note (technician only)
router.post(
  '/requests/:requestId/notes',
  authorize('technician', 'admin'),
  noteController.createNote
);

// Delete note (technician only)
router.delete(
  '/notes/:noteId',
  authorize('technician', 'admin'),
  noteController.deleteNote
);

export default router;
