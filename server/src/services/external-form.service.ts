/**
 * External Form Service
 * Handles request creation from external forms (Google Form, etc.)
 */

import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import * as requestService from './request.service.js';

interface ExternalFormInput {
  // User info
  name: string;
  email?: string;
  phone?: string;
  department?: string;

  // Request info
  title: string;
  description?: string;
  categoryName: string;  // Category name (Thai or English)
  locationName: string;  // Location name (building/floor/room)
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface ExternalFormResult {
  success: boolean;
  requestNumber?: string;
  requestId?: string;
  error?: string;
}

/**
 * Validate API key
 */
export function validateApiKey(apiKey: string | undefined): boolean {
  if (!env.EXTERNAL_FORM_API_KEY) {
    console.warn('[ExternalForm] EXTERNAL_FORM_API_KEY not configured');
    return false;
  }
  return apiKey === env.EXTERNAL_FORM_API_KEY;
}

/**
 * Find or create user for external form submission
 */
async function findOrCreateUser(input: {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
}): Promise<string> {
  // Try to find existing user by email first
  if (input.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingUser) {
      return existingUser.id;
    }
  }

  // Try to find by phone
  if (input.phone) {
    const existingUser = await prisma.user.findFirst({
      where: { phone: input.phone },
    });
    if (existingUser) {
      return existingUser.id;
    }
  }

  // Create new user (without password - can only login via LINE or admin sets password)
  const newUser = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      department: input.department,
      // No password hash - user can be linked to LINE account later
    },
  });

  console.log(`[ExternalForm] Created new user: ${newUser.id} (${input.name})`);
  return newUser.id;
}

/**
 * Find category by name (Thai or English)
 */
async function findCategory(name: string): Promise<string | null> {
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { contains: name, mode: 'insensitive' } },
        { nameTh: { contains: name, mode: 'insensitive' } },
      ],
      isActive: true,
    },
  });
  return category?.id ?? null;
}

/**
 * Find location by name (building/floor/room search)
 */
async function findLocation(name: string): Promise<string | null> {
  // First try exact match
  let location = await prisma.location.findFirst({
    where: {
      OR: [
        { building: { contains: name, mode: 'insensitive' } },
        { floor: { contains: name, mode: 'insensitive' } },
        { room: { contains: name, mode: 'insensitive' } },
      ],
      isActive: true,
    },
  });

  if (location) return location.id;

  // Try to parse "building floor room" format
  const parts = name.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 1) {
    location = await prisma.location.findFirst({
      where: {
        AND: parts.map((part) => ({
          OR: [
            { building: { contains: part, mode: 'insensitive' } },
            { floor: { contains: part, mode: 'insensitive' } },
            { room: { contains: part, mode: 'insensitive' } },
          ],
        })),
        isActive: true,
      },
    });
  }

  return location?.id ?? null;
}

/**
 * Get default category (first active one)
 */
async function getDefaultCategory(): Promise<string | null> {
  const category = await prisma.category.findFirst({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return category?.id ?? null;
}

/**
 * Get default location (first active one)
 */
async function getDefaultLocation(): Promise<string | null> {
  const location = await prisma.location.findFirst({
    where: { isActive: true },
    orderBy: { building: 'asc' },
  });
  return location?.id ?? null;
}

/**
 * Create request from external form
 */
export async function createFromExternalForm(
  input: ExternalFormInput
): Promise<ExternalFormResult> {
  try {
    // 1. Find or create user
    const userId = await findOrCreateUser({
      name: input.name,
      email: input.email,
      phone: input.phone,
      department: input.department,
    });

    // 2. Find category
    let categoryId = await findCategory(input.categoryName);
    if (!categoryId) {
      console.warn(`[ExternalForm] Category not found: ${input.categoryName}, using default`);
      categoryId = await getDefaultCategory();
      if (!categoryId) {
        return { success: false, error: 'No categories configured in system' };
      }
    }

    // 3. Find location
    let locationId = await findLocation(input.locationName);
    if (!locationId) {
      console.warn(`[ExternalForm] Location not found: ${input.locationName}, using default`);
      locationId = await getDefaultLocation();
      if (!locationId) {
        return { success: false, error: 'No locations configured in system' };
      }
    }

    // 4. Create request (this will also trigger LINE notification)
    const request = await requestService.createRequest({
      userId,
      categoryId,
      locationId,
      title: input.title,
      description: input.description,
      priority: input.priority || 'normal',
    });

    console.log(`[ExternalForm] Request created: ${request.requestNumber}`);

    return {
      success: true,
      requestNumber: request.requestNumber,
      requestId: request.id,
    };
  } catch (error) {
    console.error('[ExternalForm] Error creating request:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
