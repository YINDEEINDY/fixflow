import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { prisma } from '../config/db.js';
import { RequestStatus, Priority } from '@prisma/client';

interface ExportFilters {
  status?: RequestStatus;
  priority?: Priority;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
}

const statusLabels: Record<string, string> = {
  pending: 'รอดำเนินการ',
  assigned: 'มอบหมายแล้ว',
  accepted: 'รับงานแล้ว',
  in_progress: 'กำลังดำเนินการ',
  on_hold: 'พักงาน',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  rejected: 'ปฏิเสธ',
};

const priorityLabels: Record<string, string> = {
  low: 'ต่ำ',
  normal: 'ปกติ',
  high: 'สูง',
  urgent: 'ด่วนมาก',
};

async function getRequestsForExport(filters: ExportFilters) {
  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.categoryId) where.categoryId = filters.categoryId;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) (where.createdAt as Record<string, Date>).gte = filters.startDate;
    if (filters.endDate) (where.createdAt as Record<string, Date>).lte = filters.endDate;
  }

  return prisma.request.findMany({
    where,
    include: {
      category: true,
      location: true,
      user: {
        select: { name: true, department: true },
      },
      technician: {
        include: {
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function exportToExcel(filters: ExportFilters): Promise<Buffer> {
  const requests = await getRequestsForExport(filters);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FixFlow';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('รายงานการแจ้งซ่อม');

  // Set columns
  sheet.columns = [
    { header: 'เลขที่', key: 'requestNumber', width: 20 },
    { header: 'วันที่แจ้ง', key: 'createdAt', width: 15 },
    { header: 'หัวข้อ', key: 'title', width: 40 },
    { header: 'หมวดหมู่', key: 'category', width: 15 },
    { header: 'สถานที่', key: 'location', width: 25 },
    { header: 'ผู้แจ้ง', key: 'userName', width: 20 },
    { header: 'แผนก', key: 'department', width: 20 },
    { header: 'ความเร่งด่วน', key: 'priority', width: 12 },
    { header: 'สถานะ', key: 'status', width: 15 },
    { header: 'ช่าง', key: 'technician', width: 20 },
    { header: 'วันที่เสร็จ', key: 'completedAt', width: 15 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F81BD' },
  };
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add data
  requests.forEach((request) => {
    const location = request.location;
    const locationStr = `${location.building}${location.floor ? ` ชั้น ${location.floor}` : ''}${location.room ? ` ห้อง ${location.room}` : ''}`;

    sheet.addRow({
      requestNumber: request.requestNumber,
      createdAt: request.createdAt.toLocaleDateString('th-TH'),
      title: request.title,
      category: request.category.nameTh,
      location: locationStr,
      userName: request.user.name,
      department: request.user.department || '-',
      priority: priorityLabels[request.priority] || request.priority,
      status: statusLabels[request.status] || request.status,
      technician: request.technician?.user.name || '-',
      completedAt: request.completedAt
        ? request.completedAt.toLocaleDateString('th-TH')
        : '-',
    });
  });

  // Add summary row
  sheet.addRow({});
  sheet.addRow({
    requestNumber: `รวมทั้งหมด: ${requests.length} รายการ`,
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function exportToPdf(filters: ExportFilters): Promise<Buffer> {
  const requests = await getRequestsForExport(filters);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 30,
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Register Thai font (using default for now - would need Thai font file)
    // doc.registerFont('Thai', 'path/to/thai-font.ttf');

    // Title
    doc.fontSize(18).text('รายงานการแจ้งซ่อม FixFlow', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`สร้างเมื่อ: ${new Date().toLocaleDateString('th-TH')}`, { align: 'right' });
    doc.moveDown();

    // Summary
    const statusCounts = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    doc.fontSize(12).text('สรุป:');
    doc.fontSize(10);
    doc.text(`- รายการทั้งหมด: ${requests.length}`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      doc.text(`- ${statusLabels[status] || status}: ${count}`);
    });
    doc.moveDown();

    // Table header
    const tableTop = doc.y;
    const colWidths = [80, 60, 150, 80, 100, 80, 80, 60];
    const headers = ['เลขที่', 'วันที่', 'หัวข้อ', 'หมวด', 'สถานที่', 'ผู้แจ้ง', 'ช่าง', 'สถานะ'];

    let x = 30;
    doc.font('Helvetica-Bold').fontSize(9);
    headers.forEach((header, i) => {
      doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });

    // Table rows
    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;

    requests.forEach((request) => {
      if (y > 550) {
        doc.addPage();
        y = 30;
      }

      const location = request.location;
      const locationStr = `${location.building}${location.floor ? ` ${location.floor}` : ''}`;

      x = 30;
      const rowData = [
        request.requestNumber,
        request.createdAt.toLocaleDateString('th-TH'),
        request.title.substring(0, 30) + (request.title.length > 30 ? '...' : ''),
        request.category.nameTh,
        locationStr,
        request.user.name,
        request.technician?.user.name || '-',
        statusLabels[request.status] || request.status,
      ];

      rowData.forEach((text, i) => {
        doc.text(text, x, y, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });

      y += 15;
    });

    doc.end();
  });
}

export async function getExportStats(filters: ExportFilters) {
  const requests = await getRequestsForExport(filters);

  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = requests.reduce((acc, r) => {
    acc[r.priority] = (acc[r.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryCounts = requests.reduce((acc, r) => {
    acc[r.category.nameTh] = (acc[r.category.nameTh] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: requests.length,
    byStatus: statusCounts,
    byPriority: priorityCounts,
    byCategory: categoryCounts,
  };
}
