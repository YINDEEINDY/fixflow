import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import * as uploadController from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
    files: 10, // Max 10 files per request
  },
});

// Error handler for multer errors
const handleMulterError = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 5MB limit',
        },
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: 'Maximum 10 files allowed per upload',
        },
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FILE',
          message: 'Unexpected file field',
        },
      });
    }
  }

  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'Only image files are allowed (jpeg, png, gif, webp)',
      },
    });
  }

  next(err);
};

// All upload routes require authentication
router.use(authenticate);

// Single image upload with error handling
router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, uploadController.uploadImage);

// Multiple images upload with error handling
router.post('/images', (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next);
    next();
  });
}, uploadController.uploadMultipleImages);

// Delete file
router.delete('/:filename', uploadController.deleteFile);

export default router;
