import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as settingsService from '../services/settings.service.js';
import * as discordNotify from '../services/discord-notify.service.js';
import * as discordBot from '../services/discord-bot.service.js';
import * as lineBotService from '../services/line-bot.service.js';
import * as notifyDispatcher from '../services/notify-dispatcher.service.js';

export async function getSettings(_req: AuthRequest, res: Response) {
  try {
    const settings = await settingsService.getSettings();

    // Mask sensitive values
    const maskedSettings = {
      ...settings,
      discordWebhookUrl: settings.discordWebhookUrl ? '********' : null,
      discordBotToken: settings.discordBotToken ? '********' : null,
      emailSmtpPassword: settings.emailSmtpPassword ? '********' : null,
    };

    return res.json({ success: true, data: maskedSettings });
  } catch (error) {
    console.error('Get settings error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get settings' },
    });
  }
}

export async function updateSettings(req: AuthRequest, res: Response) {
  try {
    const input = req.body;

    // Don't overwrite password fields if they're masked
    if (input.discordWebhookUrl === '********') {
      delete input.discordWebhookUrl;
    }
    if (input.discordBotToken === '********') {
      delete input.discordBotToken;
    }
    if (input.emailSmtpPassword === '********') {
      delete input.emailSmtpPassword;
    }

    const settings = await settingsService.updateSettings(input);

    // Mask sensitive values
    const maskedSettings = {
      ...settings,
      discordWebhookUrl: settings.discordWebhookUrl ? '********' : null,
      discordBotToken: settings.discordBotToken ? '********' : null,
      emailSmtpPassword: settings.emailSmtpPassword ? '********' : null,
    };

    return res.json({ success: true, data: maskedSettings });
  } catch (error) {
    console.error('Update settings error:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update settings' },
    });
  }
}

export async function testDiscord(_req: AuthRequest, res: Response) {
  try {
    const settings = await settingsService.getSettings();

    if (!settings.discordWebhookUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_WEBHOOK', message: 'Discord Webhook URL not configured' },
      });
    }

    const success = await discordNotify.testDiscordWebhook();

    if (!success) {
      return res.status(400).json({
        success: false,
        error: { code: 'DISCORD_ERROR', message: 'Failed to send Discord notification' },
      });
    }

    return res.json({ success: true, data: { message: 'Test notification sent successfully' } });
  } catch (err) {
    console.error('Test Discord error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to test Discord notification' },
    });
  }
}

export async function testDiscordBot(_req: AuthRequest, res: Response) {
  try {
    const result = await discordBot.testBotConnection();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'BOT_ERROR', message: result.message },
      });
    }

    return res.json({
      success: true,
      data: {
        message: result.message,
        guilds: result.guilds,
      },
    });
  } catch (err) {
    console.error('Test Discord Bot error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to test Discord Bot' },
    });
  }
}

export async function getDiscordChannels(_req: AuthRequest, res: Response) {
  try {
    const channels = await discordBot.getGuildChannels();

    // Filter to show only text channels and categories
    const filteredChannels = channels
      .filter((ch) => ch.type === 0 || ch.type === 4) // 0 = text, 4 = category
      .map((ch) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type === 4 ? 'category' : 'text',
        parentId: ch.parent_id,
      }));

    return res.json({ success: true, data: filteredChannels });
  } catch (err) {
    console.error('Get Discord channels error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to get Discord channels' },
    });
  }
}

export async function testLineBot(_req: AuthRequest, res: Response) {
  try {
    const success = await lineBotService.testLineBotConnection();

    if (!success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LINE_BOT_ERROR',
          message: 'Failed to send LINE Bot notification. Check Channel Access Token and Group ID.',
        },
      });
    }

    return res.json({
      success: true,
      data: { message: 'LINE Bot test notification sent successfully' },
    });
  } catch (err) {
    console.error('Test LINE Bot error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to test LINE Bot notification' },
    });
  }
}

export async function testAllNotifications(_req: AuthRequest, res: Response) {
  try {
    const results = await notifyDispatcher.testAll();

    return res.json({
      success: true,
      data: {
        discord: results.discord,
        lineBot: results.lineBot,
        message: `Discord: ${results.discord ? 'OK' : 'Failed'}, LINE Bot: ${results.lineBot ? 'OK' : 'Failed'}`,
      },
    });
  } catch (err) {
    console.error('Test all notifications error:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to test notifications' },
    });
  }
}
