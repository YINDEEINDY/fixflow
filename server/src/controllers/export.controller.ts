import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as exportService from '../services/export.service.js';
import { RequestStatus, Priority } from '@prisma/client';

function parseFilters(query: Record<string, unknown>) {
  const filters: Record<string, unknown> = {};

  if (query.status && typeof query.status === 'string') {
    filters.status = query.status as RequestStatus;
  }

  if (query.priority && typeof query.priority === 'string') {
    filters.priority = query.priority as Priority;
  }

  if (query.categoryId && typeof query.categoryId === 'string') {
    filters.categoryId = query.categoryId;
  }

  if (query.startDate && typeof query.startDate === 'string') {
    filters.startDate = new Date(query.startDate);
  }

  if (query.endDate && typeof query.endDate === 'string') {
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);
    filters.endDate = endDate;
  }

  return filters;
}

export async function exportExcel(req: AuthRequest, res: Response) {
  try {
    const filters = parseFilters(req.query as Record<string, unknown>);
    const buffer = await exportService.exportToExcel(filters);

    const filename = `fixflow-report-${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export Excel error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'EXPORT_ERROR', message: 'Failed to export to Excel' },
    });
  }
}

export async function exportPdf(req: AuthRequest, res: Response) {
  try {
    const filters = parseFilters(req.query as Record<string, unknown>);
    const buffer = await exportService.exportToPdf(filters);

    const filename = `fixflow-report-${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'EXPORT_ERROR', message: 'Failed to export to PDF' },
    });
  }
}

export async function getExportStats(req: AuthRequest, res: Response) {
  try {
    const filters = parseFilters(req.query as Record<string, unknown>);
    const stats = await exportService.getExportStats(filters);

    return res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Get export stats error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get export stats' },
    });
  }
}
