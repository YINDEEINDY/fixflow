import { api } from './client';

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  discordWebhookUrl: string | null;
  discordBotToken: string | null;
  discordGuildId: string | null;
  discordCategoryId: string | null;
  discordNotifyChannelId: string | null;
  discordEnabled: boolean;
  emailSmtpHost: string | null;
  emailSmtpPort: number | null;
  emailSmtpUser: string | null;
  emailSmtpPassword: string | null;
  emailFrom: string | null;
  emailEnabled: boolean;
  maintenanceMode: boolean;
  autoAssignEnabled: boolean;
  defaultPriority: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: string[];
}

export interface DiscordChannel {
  id: string;
  name: string;
  type: 'category' | 'text';
  parentId?: string;
}

export const settingsApi = {
  getSettings: () => api.get<SystemSettings>('/settings'),

  updateSettings: (input: Partial<SystemSettings>) => api.put<SystemSettings>('/settings', input),

  testDiscord: () => api.post<{ message: string }>('/settings/test-discord'),

  testDiscordBot: () =>
    api.post<{ message: string; guilds?: string[] }>('/settings/test-discord-bot'),

  getDiscordChannels: () => api.get<DiscordChannel[]>('/settings/discord-channels'),
};
