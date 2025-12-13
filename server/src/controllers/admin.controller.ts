import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as adminService from '../services/admin.service.js';
import { Role } from '@prisma/client';

// ============ USER MANAGEMENT ============

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const {
      page = '1',
      limit = '10',
      role,
      search,
      isActive,
    } = req.query;

    const result = await adminService.getUsers({
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      role: role as Role | undefined,
      search: search as string | undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get users' },
    });
  }
}

export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    return res.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get user' },
    });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { email, password, name, role, phone, department } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'email, password, name, and role are required' },
      });
    }

    const user = await adminService.createUser({
      email,
      password,
      name,
      role,
      phone,
      department,
    });

    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email already exists' },
      });
    }
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create user' },
    });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, email, phone, department, role, isActive } = req.body;

    const user = await adminService.updateUser(id, {
      name,
      email,
      phone,
      department,
      role,
      isActive,
    });

    return res.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update user' },
    });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);
    return res.json({ success: true, data: { message: 'User deactivated' } });
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      });
    }
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete user' },
    });
  }
}

// ============ CATEGORY MANAGEMENT ============

export async function getCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await adminService.getCategories();
    return res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get categories' },
    });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name, nameTh, icon, color, sortOrder } = req.body;

    if (!name || !nameTh) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name and nameTh are required' },
      });
    }

    const category = await adminService.createCategory({
      name,
      nameTh,
      icon,
      color,
      sortOrder,
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error instanceof Error && error.message === 'CATEGORY_EXISTS') {
      return res.status(409).json({
        success: false,
        error: { code: 'CATEGORY_EXISTS', message: 'Category already exists' },
      });
    }
    console.error('Create category error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create category' },
    });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, nameTh, icon, color, sortOrder, isActive } = req.body;

    const category = await adminService.updateCategory(id, {
      name,
      nameTh,
      icon,
      color,
      sortOrder,
      isActive,
    });

    return res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Category not found' },
      });
    }
    console.error('Update category error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update category' },
    });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await adminService.deleteCategory(id);
    return res.json({ success: true, data: { message: 'Category deleted' } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CATEGORY_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Category not found' },
        });
      }
      if (error.message === 'CATEGORY_HAS_REQUESTS') {
        return res.status(400).json({
          success: false,
          error: { code: 'CATEGORY_HAS_REQUESTS', message: 'Cannot delete category with requests' },
        });
      }
    }
    console.error('Delete category error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete category' },
    });
  }
}

// ============ LOCATION MANAGEMENT ============

export async function getLocations(_req: AuthRequest, res: Response) {
  try {
    const locations = await adminService.getLocations();
    return res.json({ success: true, data: locations });
  } catch (error) {
    console.error('Get locations error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get locations' },
    });
  }
}

export async function createLocation(req: AuthRequest, res: Response) {
  try {
    const { building, floor, room } = req.body;

    if (!building) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'building is required' },
      });
    }

    const location = await adminService.createLocation({ building, floor, room });
    return res.status(201).json({ success: true, data: location });
  } catch (error) {
    console.error('Create location error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to create location' },
    });
  }
}

export async function updateLocation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { building, floor, room, isActive } = req.body;

    const location = await adminService.updateLocation(id, {
      building,
      floor,
      room,
      isActive,
    });

    return res.json({ success: true, data: location });
  } catch (error) {
    if (error instanceof Error && error.message === 'LOCATION_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Location not found' },
      });
    }
    console.error('Update location error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update location' },
    });
  }
}

export async function deleteLocation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await adminService.deleteLocation(id);
    return res.json({ success: true, data: { message: 'Location deleted' } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'LOCATION_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Location not found' },
        });
      }
      if (error.message === 'LOCATION_HAS_REQUESTS') {
        return res.status(400).json({
          success: false,
          error: { code: 'LOCATION_HAS_REQUESTS', message: 'Cannot delete location with requests' },
        });
      }
    }
    console.error('Delete location error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete location' },
    });
  }
}

// ============ REPORTS ============

export async function getReportStats(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    const stats = await adminService.getReportStats(start, end);
    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get report stats error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get report stats' },
    });
  }
}

export async function getMonthlyTrend(req: AuthRequest, res: Response) {
  try {
    const { months = '6' } = req.query;
    const trend = await adminService.getMonthlyTrend(parseInt(months as string, 10));
    return res.json({ success: true, data: trend });
  } catch (error) {
    console.error('Get monthly trend error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get monthly trend' },
    });
  }
}
