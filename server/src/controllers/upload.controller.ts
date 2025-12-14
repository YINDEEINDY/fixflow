import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists for fallback
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function uploadToCloudinary(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'fixflow',
        resource_type: 'image',
        transformation: [
          { width: 1920, height: 1920, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error('No result from Cloudinary'));
        }
      }
    );

    uploadStream.end(file.buffer);
  });
}

export async function uploadImage(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No file uploaded' },
      });
    }

    let fileUrl: string;

    if (isCloudinaryConfigured()) {
      // Upload to Cloudinary
      fileUrl = await uploadToCloudinary(req.file);
    } else {
      // Fallback to local storage
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
      fileUrl = `${baseUrl}/uploads/${filename}`;
    }

    return res.json({
      success: true,
      data: {
        url: fileUrl,
        filename: req.file.originalname,
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

    const files = [];

    for (const file of req.files) {
      let fileUrl: string;

      if (isCloudinaryConfigured()) {
        fileUrl = await uploadToCloudinary(file);
      } else {
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        const filePath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, file.buffer);

        const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
        fileUrl = `${baseUrl}/uploads/${filename}`;
      }

      files.push({
        url: fileUrl,
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });
    }

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

    // Check if it's a Cloudinary URL
    if (filename.includes('cloudinary.com')) {
      // Extract public_id from Cloudinary URL
      const matches = filename.match(/fixflow\/([^.]+)/);
      if (matches) {
        await cloudinary.uploader.destroy(`fixflow/${matches[1]}`);
      }
    } else {
      // Local file
      const filePath = path.join(UPLOAD_DIR, filename);

      // Security check
      if (!filePath.startsWith(UPLOAD_DIR)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PATH', message: 'Invalid file path' },
        });
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

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
