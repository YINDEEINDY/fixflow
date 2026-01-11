/**
 * External Form Controller
 * Handles request creation from external forms (Google Form, etc.)
 */

import { Request, Response } from 'express';
import * as externalFormService from '../services/external-form.service.js';

export async function createFromExternalForm(req: Request, res: Response) {
  try {
    // Validate API key from header
    const apiKey = req.headers['x-api-key'] as string | undefined;
    if (!externalFormService.validateApiKey(apiKey)) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key' },
      });
    }

    // Validate required fields
    const { name, title, categoryName, locationName } = req.body;

    if (!name || !title || !categoryName || !locationName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name, title, categoryName, and locationName are required',
        },
      });
    }

    // Create request
    const result = await externalFormService.createFromExternalForm({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      department: req.body.department,
      title: req.body.title,
      description: req.body.description,
      categoryName: req.body.categoryName,
      locationName: req.body.locationName,
      priority: req.body.priority,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'CREATE_FAILED', message: result.error },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        requestNumber: result.requestNumber,
        requestId: result.requestId,
      },
    });
  } catch (error) {
    console.error('External form error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create request' },
    });
  }
}

/**
 * Get categories for external form dropdown
 */
export async function getCategories(_req: Request, res: Response) {
  try {
    const { prisma } = await import('../config/db.js');
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nameTh: true },
      orderBy: { name: 'asc' },
    });

    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get categories' },
    });
  }
}

/**
 * Get locations for external form dropdown
 */
export async function getLocations(_req: Request, res: Response) {
  try {
    const { prisma } = await import('../config/db.js');
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      select: { id: true, building: true, floor: true, room: true },
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { room: 'asc' }],
    });

    return res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Get locations error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get locations' },
    });
  }
}
