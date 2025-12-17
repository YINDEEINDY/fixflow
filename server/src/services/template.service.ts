import { prisma } from '../config/db.js';
import { Priority } from '@prisma/client';

interface CreateTemplateInput {
  name: string;
  description?: string;
  categoryId: string;
  title: string;
  content?: string;
  priority?: Priority;
  isPublic?: boolean;
  createdBy?: string;
}

interface UpdateTemplateInput {
  name?: string;
  description?: string;
  categoryId?: string;
  title?: string;
  content?: string;
  priority?: Priority;
  isPublic?: boolean;
  isActive?: boolean;
}

// Get all active templates
export async function getTemplates(userId?: string) {
  const templates = await prisma.requestTemplate.findMany({
    where: {
      isActive: true,
      OR: [
        { isPublic: true },
        { createdBy: userId },
      ],
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          nameTh: true,
          icon: true,
          color: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { usageCount: 'desc' },
      { name: 'asc' },
    ],
  });

  return templates;
}

// Get popular templates (most used)
export async function getPopularTemplates(limit: number = 5) {
  const templates = await prisma.requestTemplate.findMany({
    where: {
      isActive: true,
      isPublic: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          nameTh: true,
          icon: true,
          color: true,
        },
      },
    },
    orderBy: { usageCount: 'desc' },
    take: limit,
  });

  return templates;
}

// Get template by ID
export async function getTemplateById(id: string) {
  const template = await prisma.requestTemplate.findUnique({
    where: { id },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!template) {
    throw new Error('TEMPLATE_NOT_FOUND');
  }

  return template;
}

// Create template
export async function createTemplate(input: CreateTemplateInput) {
  const template = await prisma.requestTemplate.create({
    data: {
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      title: input.title,
      content: input.content,
      priority: input.priority || 'normal',
      isPublic: input.isPublic ?? true,
      createdBy: input.createdBy,
    },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return template;
}

// Update template
export async function updateTemplate(id: string, userId: string, userRole: string, input: UpdateTemplateInput) {
  const template = await prisma.requestTemplate.findUnique({ where: { id } });

  if (!template) {
    throw new Error('TEMPLATE_NOT_FOUND');
  }

  // Only creator or admin can update
  if (template.createdBy !== userId && userRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  const updated = await prisma.requestTemplate.update({
    where: { id },
    data: input,
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return updated;
}

// Delete template (soft delete by setting isActive = false)
export async function deleteTemplate(id: string, userId: string, userRole: string) {
  const template = await prisma.requestTemplate.findUnique({ where: { id } });

  if (!template) {
    throw new Error('TEMPLATE_NOT_FOUND');
  }

  // Only creator or admin can delete
  if (template.createdBy !== userId && userRole !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  await prisma.requestTemplate.update({
    where: { id },
    data: { isActive: false },
  });

  return { success: true };
}

// Increment usage count when template is used
export async function incrementUsageCount(id: string) {
  await prisma.requestTemplate.update({
    where: { id },
    data: {
      usageCount: { increment: 1 },
    },
  });
}

// Get templates by category
export async function getTemplatesByCategory(categoryId: string) {
  const templates = await prisma.requestTemplate.findMany({
    where: {
      categoryId,
      isActive: true,
      isPublic: true,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          nameTh: true,
        },
      },
    },
    orderBy: { usageCount: 'desc' },
  });

  return templates;
}
