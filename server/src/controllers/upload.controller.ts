import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function uploadImage(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
    }

    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: 'Failed to upload file' },
    });
  }
}

export async function uploadMultipleImages(req: AuthRequest, res: Response) {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No files uploaded' },
      });
    }

    const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const files = req.files.map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    return res.json({
      success: true,
      data: { files },
    });
  } catch (error) {
    console.error('Upload multiple error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: 'Failed to upload files' },
    });
  }
}

export async function deleteFile(req: AuthRequest, res: Response) {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILENAME', message: 'Filename is required' },
      });
    }

    const filePath = path.join(UPLOAD_DIR, filename);

    // Security check - ensure the path is within uploads directory
    if (!filePath.startsWith(UPLOAD_DIR)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PATH', message: 'Invalid file path' },
      });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File not found' },
      });
    }

    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      data: { message: 'File deleted successfully' },
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_ERROR', message: 'Failed to delete file' },
    });
  }
}
