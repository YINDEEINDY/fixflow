import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as uploadController from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// File filter for images
const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// All upload routes require authentication
router.use(authenticate);

// Single image upload
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Multiple images upload (max 10)
router.post('/images', upload.array('images', 10), uploadController.uploadMultipleImages);

// Delete file
router.delete('/:filename', uploadController.deleteFile);

export default router;
