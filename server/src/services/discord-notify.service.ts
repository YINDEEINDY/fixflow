import * as settingsService from './settings.service.js';

// Set to true to disable all Discord notifications
const DISCORD_DISABLED = true;

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
  footer?: { text: string };
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

// Discord embed colors
const COLORS = {
  info: 0x3b82f6, // blue
  success: 0x10b981, // green
  warning: 0xf59e0b, // yellow
  error: 0xef4444, // red
  purple: 0x8b5cf6, // purple
};

export async function sendDiscordNotify(payload: DiscordWebhookPayload): Promise<boolean> {
  // Check if Discord is disabled via flag
  if (DISCORD_DISABLED) {
    console.log('Discord notifications are temporarily disabled');
    return false;
  }

  try {
    const settings = await settingsService.getSettings();

    if (!settings.discordEnabled || !settings.discordWebhookUrl) {
      console.log('Discord notifications disabled or webhook URL not configured');
      return false;
    }

    // Add default username and avatar
    const finalPayload: DiscordWebhookPayload = {
      username: settings.siteName || 'FixFlow',
      ...payload,
    };

    const response = await fetch(settings.discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord Webhook error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

// Notification templates
export async function notifyNewRequest(request: {
  requestNumber: string;
  title: string;
  category: string;
  location: string;
  priority: string;
  userName: string;
}): Promise<boolean> {
  const priorityLabels: Record<string, string> = {
    low: '🟢 ต่ำ',
    normal: '🔵 ปกติ',
    high: '🟠 สูง',
    urgent: '🔴 ด่วนมาก',
  };

  const priorityColors: Record<string, number> = {
    low: COLORS.success,
    normal: COLORS.info,
    high: COLORS.warning,
    urgent: COLORS.error,
  };

  return sendDiscordNotify({
    embeds: [
      {
        title: '📋 แจ้งซ่อมใหม่',
        description: request.title,
        color: priorityColors[request.priority] || COLORS.info,
        fields: [
          { name: 'เลขที่', value: request.requestNumber, inline: true },
          { name: 'หมวดหมู่', value: request.category, inline: true },
          {
            name: 'ความเร่งด่วน',
            value: priorityLabels[request.priority] || request.priority,
            inline: true,
          },
          { name: 'สถานที่', value: request.location, inline: false },
          { name: 'ผู้แจ้ง', value: request.userName, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestAssigned(request: {
  requestNumber: string;
  title: string;
  technicianName: string;
}): Promise<boolean> {
  return sendDiscordNotify({
    embeds: [
      {
        title: '🔧 มอบหมายงาน',
        description: request.title,
        color: COLORS.purple,
        fields: [
          { name: 'เลขที่', value: request.requestNumber, inline: true },
          { name: 'ช่างที่รับผิดชอบ', value: request.technicianName, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestStatusChange(request: {
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

  const statusColors: Record<string, number> = {
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
    { name: 'เลขที่', value: request.requestNumber, inline: true },
    {
      name: 'สถานะ',
      value: `${statusLabels[request.oldStatus] || request.oldStatus} → ${statusLabels[request.newStatus] || request.newStatus}`,
      inline: true,
    },
  ];

  if (request.note) {
    fields.push({ name: 'หมายเหตุ', value: request.note, inline: false });
  }

  return sendDiscordNotify({
    embeds: [
      {
        title: '📌 สถานะเปลี่ยน',
        description: request.title,
        color: statusColors[request.newStatus] || COLORS.info,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestCompleted(request: {
  requestNumber: string;
  title: string;
  technicianName: string;
  note?: string;
}): Promise<boolean> {
  const fields = [
    { name: 'เลขที่', value: request.requestNumber, inline: true },
    { name: 'ดำเนินการโดย', value: request.technicianName, inline: true },
  ];

  if (request.note) {
    fields.push({ name: 'หมายเหตุ', value: request.note, inline: false });
  }

  return sendDiscordNotify({
    embeds: [
      {
        title: '🎉 งานเสร็จสิ้น',
        description: request.title,
        color: COLORS.success,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyDailyReport(stats: {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedToday: number;
}): Promise<boolean> {
  return sendDiscordNotify({
    embeds: [
      {
        title: '📊 รายงานประจำวัน',
        color: COLORS.info,
        fields: [
          { name: 'คำร้องทั้งหมด', value: stats.totalRequests.toString(), inline: true },
          { name: 'รอดำเนินการ', value: stats.pendingRequests.toString(), inline: true },
          { name: 'กำลังดำเนินการ', value: stats.inProgressRequests.toString(), inline: true },
          { name: 'เสร็จสิ้นวันนี้', value: stats.completedToday.toString(), inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestCancelled(request: {
  requestNumber: string;
  title: string;
  userName: string;
  reason?: string;
}): Promise<boolean> {
  const fields = [
    { name: 'เลขที่', value: request.requestNumber, inline: true },
    { name: 'ยกเลิกโดย', value: request.userName, inline: true },
  ];

  if (request.reason) {
    fields.push({ name: 'เหตุผล', value: request.reason, inline: false });
  }

  return sendDiscordNotify({
    embeds: [
      {
        title: '❌ ยกเลิกคำร้อง',
        description: request.title,
        color: COLORS.error,
        fields,
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestRejected(request: {
  requestNumber: string;
  title: string;
  technicianName: string;
  reason: string;
}): Promise<boolean> {
  return sendDiscordNotify({
    embeds: [
      {
        title: '🚫 ช่างปฏิเสธงาน',
        description: request.title,
        color: COLORS.warning,
        fields: [
          { name: 'เลขที่', value: request.requestNumber, inline: true },
          { name: 'ช่าง', value: request.technicianName, inline: true },
          { name: 'เหตุผล', value: request.reason, inline: false },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestAccepted(request: {
  requestNumber: string;
  title: string;
  technicianName: string;
}): Promise<boolean> {
  return sendDiscordNotify({
    embeds: [
      {
        title: '✅ ช่างรับงานแล้ว',
        description: request.title,
        color: COLORS.success,
        fields: [
          { name: 'เลขที่', value: request.requestNumber, inline: true },
          { name: 'ช่าง', value: request.technicianName, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

export async function notifyRequestStarted(request: {
  requestNumber: string;
  title: string;
  technicianName: string;
}): Promise<boolean> {
  return sendDiscordNotify({
    embeds: [
      {
        title: '🔧 เริ่มดำเนินการ',
        description: request.title,
        color: COLORS.purple,
        fields: [
          { name: 'เลขที่', value: request.requestNumber, inline: true },
          { name: 'ช่าง', value: request.technicianName, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}

// Test function
export async function testDiscordWebhook(): Promise<boolean> {
  const settings = await settingsService.getSettings();

  if (!settings.discordWebhookUrl) {
    throw new Error('Discord Webhook URL not configured');
  }

  return sendDiscordNotify({
    embeds: [
      {
        title: '✅ ทดสอบการเชื่อมต่อ',
        description: 'FixFlow Discord Webhook ทำงานได้ถูกต้อง!',
        color: COLORS.success,
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}
