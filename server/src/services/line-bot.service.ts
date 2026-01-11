import * as settingsService from './settings.service.js';
import { env } from '../config/env.js';

interface LineMessage {
  type: 'text' | 'flex';
  text?: string;
  altText?: string;
  contents?: FlexContainer;
}

interface FlexContainer {
  type: 'bubble' | 'carousel';
  header?: FlexBox;
  hero?: FlexImage;
  body?: FlexBox;
  footer?: FlexBox;
  styles?: {
    header?: { backgroundColor?: string };
    body?: { backgroundColor?: string };
    footer?: { backgroundColor?: string };
  };
}

interface FlexBox {
  type: 'box';
  layout: 'horizontal' | 'vertical' | 'baseline';
  contents: FlexComponent[];
  spacing?: string;
  margin?: string;
  paddingAll?: string;
}

interface FlexComponent {
  type: 'text' | 'box' | 'button' | 'separator' | 'spacer';
  text?: string;
  size?: string;
  weight?: string;
  color?: string;
  wrap?: boolean;
  layout?: string;
  contents?: FlexComponent[];
  margin?: string;
  flex?: number;
  action?: {
    type: 'uri' | 'message' | 'postback';
    label?: string;
    uri?: string;
    text?: string;
    data?: string;
  };
  style?: 'primary' | 'secondary' | 'link';
  height?: string;
}

interface FlexImage {
  type: 'image';
  url: string;
  size?: string;
  aspectRatio?: string;
  aspectMode?: string;
}

// Colors for status
const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
};

export async function sendLineBotMessage(messages: LineMessage[], to?: string): Promise<boolean> {
  try {
    const settings = await settingsService.getSettings();
    const channelAccessToken = env.LINE_BOT_CHANNEL_ACCESS_TOKEN;
    const defaultGroupId = settings.lineBotGroupId || env.LINE_BOT_GROUP_ID;

    if (!settings.lineBotEnabled || !channelAccessToken) {
      console.log('LINE Bot notifications disabled or not configured');
      return false;
    }

    const targetId = to || defaultGroupId;
    if (!targetId) {
      console.log('No LINE target ID specified');
      return false;
    }

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: targetId,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE Bot error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send LINE Bot notification:', error);
    return false;
  }
}

// Helper to create Flex Message bubble with optional action button
function createFlexBubble(
  title: string,
  titleColor: string,
  description: string,
  fields: { label: string; value: string }[],
  footerText: string,
  actionUrl?: string
): FlexContainer {
  const footerContents: FlexComponent[] = [];

  // Add action button if URL is provided
  if (actionUrl) {
    footerContents.push({
      type: 'button',
      style: 'primary',
      height: 'sm',
      action: {
        type: 'uri',
        label: 'ดูรายละเอียด',
        uri: actionUrl,
      },
    });
  }

  footerContents.push({
    type: 'text',
    text: footerText,
    size: 'xs',
    color: '#999999',
    margin: actionUrl ? 'md' : undefined,
  });

  return {
    type: 'bubble',
    styles: {
      header: { backgroundColor: titleColor },
    },
    header: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: title,
          color: '#FFFFFF',
          size: 'lg',
          weight: 'bold',
        },
      ],
      paddingAll: '15px',
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: description,
          size: 'md',
          weight: 'bold',
          wrap: true,
        },
        {
          type: 'separator',
          margin: 'lg',
        },
        ...fields.map((field) => ({
          type: 'box' as const,
          layout: 'horizontal' as const,
          margin: 'md',
          contents: [
            {
              type: 'text' as const,
              text: field.label,
              size: 'sm',
              color: '#666666',
              flex: 1,
            },
            {
              type: 'text' as const,
              text: field.value,
              size: 'sm',
              color: '#333333',
              flex: 2,
              wrap: true,
            },
          ],
        })),
      ],
      paddingAll: '15px',
      spacing: 'sm',
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: footerContents,
      paddingAll: '10px',
      spacing: 'sm',
    },
  };
}

// Helper to generate request detail URL
function getRequestDetailUrl(requestId: string): string {
  return `${env.APP_URL}/requests/${requestId}`;
}

// Notification templates
export async function notifyNewRequest(request: {
  id: string;
  requestNumber: string;
  title: string;
  description?: string;
  category: string;
  location: string;
  priority: string;
  userName: string;
  userPhone?: string;
  createdAt?: Date;
}): Promise<boolean> {
  const priorityLabels: Record<string, string> = {
    low: '🟢 ต่ำ',
    normal: '🔵 ปกติ',
    high: '🟠 สูง',
    urgent: '🔴 ด่วนมาก',
  };

  const priorityColors: Record<string, string> = {
    low: COLORS.success,
    normal: COLORS.info,
    high: COLORS.warning,
    urgent: COLORS.error,
  };

  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    { label: 'หมวดหมู่', value: request.category },
    { label: 'ความเร่งด่วน', value: priorityLabels[request.priority] || request.priority },
    { label: 'สถานที่', value: request.location },
    { label: 'ผู้แจ้ง', value: request.userName },
  ];

  // Add phone if available
  if (request.userPhone) {
    fields.push({ label: 'เบอร์โทร', value: request.userPhone });
  }

  // Add description if available (truncate if too long)
  if (request.description) {
    const desc = request.description.length > 100
      ? request.description.substring(0, 100) + '...'
      : request.description;
    fields.push({ label: 'รายละเอียด', value: desc });
  }

  const flexContent = createFlexBubble(
    '📋 แจ้งซ่อมใหม่',
    priorityColors[request.priority] || COLORS.info,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `แจ้งซ่อมใหม่: ${request.requestNumber} - ${request.title}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestAssigned(request: {
  id: string;
  requestNumber: string;
  title: string;
  technicianName: string;
  category?: string;
  location?: string;
}): Promise<boolean> {
  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    { label: 'ช่าง', value: request.technicianName },
  ];

  if (request.category) {
    fields.push({ label: 'หมวดหมู่', value: request.category });
  }
  if (request.location) {
    fields.push({ label: 'สถานที่', value: request.location });
  }

  const flexContent = createFlexBubble(
    '🔧 มอบหมายงาน',
    COLORS.purple,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `มอบหมายงาน: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestAccepted(request: {
  id: string;
  requestNumber: string;
  title: string;
  technicianName: string;
  location?: string;
}): Promise<boolean> {
  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    { label: 'ช่าง', value: request.technicianName },
  ];

  if (request.location) {
    fields.push({ label: 'สถานที่', value: request.location });
  }

  const flexContent = createFlexBubble(
    '✅ ช่างรับงานแล้ว',
    COLORS.success,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `ช่างรับงาน: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestStarted(request: {
  id: string;
  requestNumber: string;
  title: string;
  technicianName: string;
  location?: string;
}): Promise<boolean> {
  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    { label: 'ช่าง', value: request.technicianName },
  ];

  if (request.location) {
    fields.push({ label: 'สถานที่', value: request.location });
  }

  const flexContent = createFlexBubble(
    '🔧 เริ่มดำเนินการ',
    COLORS.purple,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `เริ่มดำเนินการ: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestCompleted(request: {
  id: string;
  requestNumber: string;
  title: string;
  technicianName: string;
  note?: string;
  location?: string;
}): Promise<boolean> {
  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    { label: 'ดำเนินการโดย', value: request.technicianName },
  ];

  if (request.location) {
    fields.push({ label: 'สถานที่', value: request.location });
  }

  if (request.note) {
    const note = request.note.length > 100
      ? request.note.substring(0, 100) + '...'
      : request.note;
    fields.push({ label: 'หมายเหตุ', value: note });
  }

  const flexContent = createFlexBubble(
    '🎉 งานเสร็จสิ้น',
    COLORS.success,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `งานเสร็จสิ้น: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestCancelled(request: {
  id: string;
  requestNumber: string;
  title: string;
  userName: string;
  reason?: string;
}): Promise<boolean> {
  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    { label: 'ยกเลิกโดย', value: request.userName },
  ];

  if (request.reason) {
    fields.push({ label: 'เหตุผล', value: request.reason });
  }

  const flexContent = createFlexBubble(
    '❌ ยกเลิกคำร้อง',
    COLORS.error,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `ยกเลิกคำร้อง: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestRejected(request: {
  id: string;
  requestNumber: string;
  title: string;
  technicianName: string;
  reason: string;
}): Promise<boolean> {
  const flexContent = createFlexBubble(
    '🚫 ช่างปฏิเสธงาน',
    COLORS.warning,
    request.title,
    [
      { label: 'เลขที่', value: request.requestNumber },
      { label: 'ช่าง', value: request.technicianName },
      { label: 'เหตุผล', value: request.reason },
    ],
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `ช่างปฏิเสธงาน: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyRequestStatusChange(request: {
  id: string;
  requestNumber: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
}): Promise<boolean> {
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

  const statusColors: Record<string, string> = {
    pending: COLORS.warning,
    assigned: COLORS.info,
    accepted: COLORS.info,
    in_progress: COLORS.purple,
    on_hold: COLORS.warning,
    completed: COLORS.success,
    cancelled: COLORS.error,
    rejected: COLORS.error,
  };

  const fields = [
    { label: 'เลขที่', value: request.requestNumber },
    {
      label: 'สถานะ',
      value: `${statusLabels[request.oldStatus] || request.oldStatus} → ${statusLabels[request.newStatus] || request.newStatus}`,
    },
  ];

  if (request.note) {
    fields.push({ label: 'หมายเหตุ', value: request.note });
  }

  const flexContent = createFlexBubble(
    '📌 สถานะเปลี่ยน',
    statusColors[request.newStatus] || COLORS.info,
    request.title,
    fields,
    `FixFlow • ${new Date().toLocaleString('th-TH')}`,
    getRequestDetailUrl(request.id)
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: `สถานะเปลี่ยน: ${request.requestNumber}`,
      contents: flexContent,
    },
  ]);
}

export async function notifyDailyReport(stats: {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedToday: number;
}): Promise<boolean> {
  const flexContent = createFlexBubble(
    '📊 รายงานประจำวัน',
    COLORS.info,
    `สรุปงานซ่อมบำรุง`,
    [
      { label: 'คำร้องทั้งหมด', value: stats.totalRequests.toString() },
      { label: 'รอดำเนินการ', value: stats.pendingRequests.toString() },
      { label: 'กำลังดำเนินการ', value: stats.inProgressRequests.toString() },
      { label: 'เสร็จสิ้นวันนี้', value: stats.completedToday.toString() },
    ],
    `FixFlow • ${new Date().toLocaleString('th-TH')}`
  );

  return sendLineBotMessage([
    {
      type: 'flex',
      altText: 'รายงานประจำวัน FixFlow',
      contents: flexContent,
    },
  ]);
}

// Test function
export async function testLineBotConnection(): Promise<boolean> {
  const channelAccessToken = env.LINE_BOT_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    throw new Error('LINE Bot Channel Access Token not configured');
  }

  return sendLineBotMessage([
    {
      type: 'text',
      text: '✅ ทดสอบการเชื่อมต่อ LINE Bot สำเร็จ!\n\nFixFlow Maintenance System',
    },
  ]);
}
