import { prisma } from '../config/db.js';

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  // Discord
  discordWebhookUrl: string | null;
  discordBotToken: string | null;
  discordGuildId: string | null;
  discordCategoryId: string | null;
  discordNotifyChannelId: string | null;
  discordEnabled: boolean;
  // LINE Bot
  lineBotGroupId: string | null;
  lineBotEnabled: boolean;
  // Email
  emailSmtpHost: string | null;
  emailSmtpPort: number | null;
  emailSmtpUser: string | null;
  emailSmtpPassword: string | null;
  emailFrom: string | null;
  emailEnabled: boolean;
  // System
  maintenanceMode: boolean;
  autoAssignEnabled: boolean;
  defaultPriority: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
}

const DEFAULT_SETTINGS: SystemSettings = {
  siteName: 'FixFlow',
  siteDescription: 'ระบบแจ้งซ่อมบำรุง',
  contactEmail: '',
  contactPhone: '',
  // Discord
  discordWebhookUrl: null,
  discordBotToken: null,
  discordGuildId: null,
  discordCategoryId: null,
  discordNotifyChannelId: null,
  discordEnabled: false,
  // LINE Bot
  lineBotGroupId: null,
  lineBotEnabled: false,
  // Email
  emailSmtpHost: null,
  emailSmtpPort: null,
  emailSmtpUser: null,
  emailSmtpPassword: null,
  emailFrom: null,
  emailEnabled: false,
  // System
  maintenanceMode: false,
  autoAssignEnabled: false,
  defaultPriority: 'normal',
  workingHoursStart: '08:00',
  workingHoursEnd: '17:00',
  workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
};

export async function getSettings(): Promise<SystemSettings> {
  const settings = await prisma.systemSetting.findMany();

  const result: SystemSettings = { ...DEFAULT_SETTINGS };
  const resultRecord = result as unknown as Record<string, unknown>;

  for (const setting of settings) {
    const key = setting.key as keyof SystemSettings;
    if (key in result) {
      try {
        // Parse JSON values for arrays and objects
        if (setting.value.startsWith('[') || setting.value.startsWith('{')) {
          resultRecord[key] = JSON.parse(setting.value);
        } else if (setting.value === 'true' || setting.value === 'false') {
          resultRecord[key] = setting.value === 'true';
        } else if (!isNaN(Number(setting.value)) && key.includes('Port')) {
          resultRecord[key] = Number(setting.value);
        } else {
          resultRecord[key] = setting.value;
        }
      } catch {
        resultRecord[key] = setting.value;
      }
    }
  }

  return result;
}

export async function updateSettings(input: Partial<SystemSettings>): Promise<SystemSettings> {
  const updates: { key: string; value: string }[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      let stringValue: string;
      if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
      } else if (typeof value === 'boolean') {
        stringValue = value ? 'true' : 'false';
      } else {
        stringValue = String(value);
      }
      updates.push({ key, value: stringValue });
    }
  }

  // Upsert each setting
  for (const update of updates) {
    await prisma.systemSetting.upsert({
      where: { key: update.key },
      update: { value: update.value },
      create: { key: update.key, value: update.value },
    });
  }

  return getSettings();
}

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key },
  });
  return setting?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
