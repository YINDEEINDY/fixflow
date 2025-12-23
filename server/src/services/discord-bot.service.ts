import * as settingsService from './settings.service.js';

const DISCORD_API_BASE = 'https://discord.com/api/v10';

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id?: string;
  parent_id?: string;
}

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  timestamp?: string;
  footer?: { text: string };
}

// Discord embed colors
const COLORS = {
  info: 0x3b82f6,
  success: 0x10b981,
  warning: 0xf59e0b,
  error: 0xef4444,
  purple: 0x8b5cf6,
};

async function getDiscordConfig() {
  const settings = await settingsService.getSettings();
  return {
    botToken: settings.discordBotToken,
    guildId: settings.discordGuildId,
    categoryId: settings.discordCategoryId,
    notifyChannelId: settings.discordNotifyChannelId,
    enabled: settings.discordEnabled,
  };
}

async function discordApiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
): Promise<unknown> {
  const config = await getDiscordConfig();

  if (!config.botToken) {
    throw new Error('Discord Bot Token not configured');
  }

  const response = await fetch(`${DISCORD_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bot ${config.botToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Discord API error:', response.status, errorText);
    throw new Error(`Discord API error: ${response.status}`);
  }

  // Some endpoints return empty body
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Create a text channel for a request
export async function createRequestChannel(request: {
  requestNumber: string;
  title: string;
  category: string;
  location: string;
  priority: string;
  userName: string;
  description?: string;
}): Promise<string | null> {
  try {
    const config = await getDiscordConfig();

    if (!config.enabled || !config.botToken || !config.guildId) {
      console.log('Discord Bot not configured');
      return null;
    }

    // Create channel name from request number (e.g., req-20241214-0001)
    const channelName = request.requestNumber.toLowerCase().replace(/_/g, '-');

    const channelData: Record<string, unknown> = {
      name: channelName,
      type: 0, // Text channel
      topic: `${request.title} | ${request.category} | ${request.location}`,
    };

    // If category ID is set, put channel under that category
    if (config.categoryId) {
      channelData.parent_id = config.categoryId;
    }

    const channel = (await discordApiRequest(
      `/guilds/${config.guildId}/channels`,
      'POST',
      channelData
    )) as DiscordChannel;

    // Send initial message to the channel
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

    await sendMessageToChannel(channel.id, {
      embeds: [
        {
          title: `📋 ${request.requestNumber}`,
          description: request.title,
          color: priorityColors[request.priority] || COLORS.info,
          fields: [
            { name: 'หมวดหมู่', value: request.category, inline: true },
            {
              name: 'ความเร่งด่วน',
              value: priorityLabels[request.priority] || request.priority,
              inline: true,
            },
            { name: 'สถานที่', value: request.location, inline: false },
            { name: 'ผู้แจ้ง', value: request.userName, inline: true },
            ...(request.description
              ? [{ name: 'รายละเอียด', value: request.description, inline: false }]
              : []),
          ],
          timestamp: new Date().toISOString(),
          footer: { text: 'FixFlow Maintenance System' },
        },
      ],
    });

    console.log(`Created Discord channel: ${channel.name} (${channel.id})`);
    return channel.id;
  } catch (error) {
    console.error('Failed to create Discord channel:', error);
    return null;
  }
}

// Send message to a specific channel
export async function sendMessageToChannel(
  channelId: string,
  message: { content?: string; embeds?: DiscordEmbed[] }
): Promise<boolean> {
  try {
    await discordApiRequest(`/channels/${channelId}/messages`, 'POST', message);
    return true;
  } catch (error) {
    console.error('Failed to send message to channel:', error);
    return false;
  }
}

// Send notification to the main notify channel
export async function sendNotification(message: {
  content?: string;
  embeds?: DiscordEmbed[];
}): Promise<boolean> {
  try {
    const config = await getDiscordConfig();

    if (!config.enabled || !config.botToken) {
      return false;
    }

    // If notify channel is set, use it; otherwise try webhook
    if (config.notifyChannelId) {
      return sendMessageToChannel(config.notifyChannelId, message);
    }

    // Fallback to webhook if no channel is set
    const settings = await settingsService.getSettings();
    if (settings.discordWebhookUrl) {
      const response = await fetch(settings.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: settings.siteName || 'FixFlow',
          ...message,
        }),
      });
      return response.ok;
    }

    return false;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Delete a channel
export async function deleteChannel(channelId: string): Promise<boolean> {
  try {
    await discordApiRequest(`/channels/${channelId}`, 'DELETE');
    return true;
  } catch (error) {
    console.error('Failed to delete channel:', error);
    return false;
  }
}

// Rename a channel
export async function renameChannel(channelId: string, newName: string): Promise<boolean> {
  try {
    await discordApiRequest(`/channels/${channelId}`, 'PATCH', { name: newName });
    return true;
  } catch (error) {
    console.error('Failed to rename channel:', error);
    return false;
  }
}

// Archive channel by moving to archive category or adding prefix
export async function archiveChannel(
  channelId: string,
  archiveCategoryId?: string
): Promise<boolean> {
  try {
    const updates: Record<string, unknown> = {};

    if (archiveCategoryId) {
      updates.parent_id = archiveCategoryId;
    }

    // Add "archived-" prefix
    const channel = (await discordApiRequest(`/channels/${channelId}`, 'GET')) as DiscordChannel;
    if (!channel.name.startsWith('archived-')) {
      updates.name = `archived-${channel.name}`;
    }

    if (Object.keys(updates).length > 0) {
      await discordApiRequest(`/channels/${channelId}`, 'PATCH', updates);
    }

    return true;
  } catch (error) {
    console.error('Failed to archive channel:', error);
    return false;
  }
}

// Get guild channels
export async function getGuildChannels(): Promise<DiscordChannel[]> {
  try {
    const config = await getDiscordConfig();
    if (!config.guildId) return [];

    const channels = (await discordApiRequest(
      `/guilds/${config.guildId}/channels`
    )) as DiscordChannel[];
    return channels;
  } catch (error) {
    console.error('Failed to get guild channels:', error);
    return [];
  }
}

// Test bot connection
export async function testBotConnection(): Promise<{
  success: boolean;
  message: string;
  guilds?: string[];
}> {
  try {
    const config = await getDiscordConfig();

    if (!config.botToken) {
      return { success: false, message: 'Bot Token not configured' };
    }

    // Get bot user info
    const botUser = (await discordApiRequest('/users/@me')) as { username: string; id: string };

    // Get guilds
    const guilds = (await discordApiRequest('/users/@me/guilds')) as { id: string; name: string }[];

    return {
      success: true,
      message: `Connected as ${botUser.username}`,
      guilds: guilds.map((g) => `${g.name} (${g.id})`),
    };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}` };
  }
}

// Notification helpers using bot
export async function notifyNewRequest(request: {
  requestNumber: string;
  title: string;
  category: string;
  location: string;
  priority: string;
  userName: string;
  description?: string;
}): Promise<{ channelId: string | null; notified: boolean }> {
  // Create channel for this request
  const channelId = await createRequestChannel(request);

  // Also send to main notification channel
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

  const notified = await sendNotification({
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

  return { channelId, notified };
}

export async function notifyToRequestChannel(
  channelId: string,
  title: string,
  description: string,
  color: number = COLORS.info
): Promise<boolean> {
  return sendMessageToChannel(channelId, {
    embeds: [
      {
        title,
        description,
        color,
        timestamp: new Date().toISOString(),
        footer: { text: 'FixFlow Maintenance System' },
      },
    ],
  });
}
