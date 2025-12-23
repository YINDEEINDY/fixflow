import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Bell,
  Mail,
  Clock,
  Shield,
  Send,
  CheckCircle,
  AlertCircle,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { settingsApi, type SystemSettings, type DiscordChannel } from '../../api/settings';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'จันทร์' },
  { value: 'tuesday', label: 'อังคาร' },
  { value: 'wednesday', label: 'พุธ' },
  { value: 'thursday', label: 'พฤหัสบดี' },
  { value: 'friday', label: 'ศุกร์' },
  { value: 'saturday', label: 'เสาร์' },
  { value: 'sunday', label: 'อาทิตย์' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'ต่ำ' },
  { value: 'normal', label: 'ปกติ' },
  { value: 'high', label: 'สูง' },
  { value: 'urgent', label: 'ด่วนมาก' },
];

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingBot, setIsTestingBot] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [discordChannels, setDiscordChannels] = useState<DiscordChannel[]>([]);
  const [botGuilds, setBotGuilds] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await settingsApi.getSettings();
      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setMessage({ type: 'error', text: 'ไม่สามารถโหลดการตั้งค่าได้' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const response = await settingsApi.updateSettings(settings);
      if (response.success) {
        setMessage({ type: 'success', text: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
        if (response.data) {
          setSettings(response.data);
        }
      } else {
        setMessage({ type: 'error', text: response.error?.message || 'เกิดข้อผิดพลาด' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึก' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestDiscord = async () => {
    setIsTesting(true);
    setMessage(null);

    try {
      const response = await settingsApi.testDiscord();
      if (response.success) {
        setMessage({ type: 'success', text: 'ส่งข้อความทดสอบ Discord สำเร็จ' });
      } else {
        setMessage({
          type: 'error',
          text: response.error?.message || 'ไม่สามารถส่งข้อความทดสอบได้',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการทดสอบ' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestBot = async () => {
    setIsTestingBot(true);
    setMessage(null);

    try {
      const response = await settingsApi.testDiscordBot();
      if (response.success && response.data) {
        setMessage({ type: 'success', text: response.data.message });
        if (response.data.guilds) {
          setBotGuilds(response.data.guilds);
        }
      } else {
        setMessage({
          type: 'error',
          text: response.error?.message || 'ไม่สามารถเชื่อมต่อ Bot ได้',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการทดสอบ Bot' });
    } finally {
      setIsTestingBot(false);
    }
  };

  const handleLoadChannels = async () => {
    setIsLoadingChannels(true);
    try {
      const response = await settingsApi.getDiscordChannels();
      if (response.success && response.data) {
        setDiscordChannels(response.data);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const updateSetting = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const toggleWorkingDay = (day: string) => {
    if (!settings) return;
    const days = settings.workingDays.includes(day)
      ? settings.workingDays.filter((d) => d !== day)
      : [...settings.workingDays, day];
    setSettings({ ...settings, workingDays: days });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!settings) {
    return <div className="text-center py-12 text-gray-500">ไม่สามารถโหลดการตั้งค่าได้</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            การตั้งค่าระบบ
          </h1>
          <p className="text-gray-600">จัดการการตั้งค่าทั่วไปของระบบ</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          บันทึก
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              ข้อมูลทั่วไป
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="ชื่อระบบ"
              value={settings.siteName}
              onChange={(e) => updateSetting('siteName', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายระบบ</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => updateSetting('siteDescription', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Input
              label="อีเมลติดต่อ"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => updateSetting('contactEmail', e.target.value)}
            />
            <Input
              label="เบอร์โทรติดต่อ"
              value={settings.contactPhone}
              onChange={(e) => updateSetting('contactPhone', e.target.value)}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="maintenanceMode" className="text-sm text-gray-700">
                โหมดปิดปรับปรุงระบบ
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Discord Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Discord
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="discordEnabled"
                checked={settings.discordEnabled}
                onChange={(e) => updateSetting('discordEnabled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="discordEnabled" className="text-sm text-gray-700">
                เปิดใช้งาน Discord แจ้งเตือน
              </label>
            </div>

            {/* Webhook Settings */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Webhook (ส่งข้อความอย่างเดียว)</h4>
              <div className="space-y-3">
                <Input
                  label="Discord Webhook URL"
                  type="password"
                  value={settings.discordWebhookUrl || ''}
                  onChange={(e) => updateSetting('discordWebhookUrl', e.target.value || null)}
                  helperText="สร้าง Webhook ได้ที่ Server Settings > Integrations > Webhooks"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestDiscord}
                  disabled={isTesting || !settings.discordWebhookUrl}
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  ทดสอบ Webhook
                </Button>
              </div>
            </div>

            {/* Bot Settings */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Bot (สร้าง Channel อัตโนมัติ)
              </h4>
              <div className="space-y-3">
                <Input
                  label="Bot Token"
                  type="password"
                  value={settings.discordBotToken || ''}
                  onChange={(e) => updateSetting('discordBotToken', e.target.value || null)}
                  helperText="รับ Token ได้ที่ Discord Developer Portal > Bot"
                />
                <Input
                  label="Guild ID (Server ID)"
                  value={settings.discordGuildId || ''}
                  onChange={(e) => updateSetting('discordGuildId', e.target.value || null)}
                  helperText="คลิกขวาที่ Server > Copy Server ID"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestBot}
                    disabled={isTestingBot || !settings.discordBotToken}
                  >
                    {isTestingBot ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Bot className="w-4 h-4 mr-2" />
                    )}
                    ทดสอบ Bot
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadChannels}
                    disabled={isLoadingChannels || !settings.discordGuildId}
                  >
                    {isLoadingChannels ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    โหลด Channels
                  </Button>
                </div>

                {botGuilds.length > 0 && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <p className="font-medium">Servers ที่ Bot เข้าถึงได้:</p>
                    <ul className="list-disc list-inside">
                      {botGuilds.map((guild, i) => (
                        <li key={i}>{guild}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {discordChannels.length > 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category สำหรับสร้าง Channel
                      </label>
                      <select
                        value={settings.discordCategoryId || ''}
                        onChange={(e) => updateSetting('discordCategoryId', e.target.value || null)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">-- ไม่ระบุ --</option>
                        {discordChannels
                          .filter((ch) => ch.type === 'category')
                          .map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Channel สำหรับแจ้งเตือนทั่วไป
                      </label>
                      <select
                        value={settings.discordNotifyChannelId || ''}
                        onChange={(e) =>
                          updateSetting('discordNotifyChannelId', e.target.value || null)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">-- ใช้ Webhook แทน --</option>
                        {discordChannels
                          .filter((ch) => ch.type === 'text')
                          .map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              #{ch.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              อีเมล (SMTP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={settings.emailEnabled}
                onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="emailEnabled" className="text-sm text-gray-700">
                เปิดใช้งานการส่งอีเมล
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="SMTP Host"
                value={settings.emailSmtpHost || ''}
                onChange={(e) => updateSetting('emailSmtpHost', e.target.value || null)}
                placeholder="smtp.gmail.com"
              />
              <Input
                label="SMTP Port"
                type="number"
                value={settings.emailSmtpPort || ''}
                onChange={(e) =>
                  updateSetting('emailSmtpPort', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="587"
              />
            </div>
            <Input
              label="SMTP Username"
              value={settings.emailSmtpUser || ''}
              onChange={(e) => updateSetting('emailSmtpUser', e.target.value || null)}
            />
            <Input
              label="SMTP Password"
              type="password"
              value={settings.emailSmtpPassword || ''}
              onChange={(e) => updateSetting('emailSmtpPassword', e.target.value || null)}
            />
            <Input
              label="อีเมลผู้ส่ง"
              type="email"
              value={settings.emailFrom || ''}
              onChange={(e) => updateSetting('emailFrom', e.target.value || null)}
              placeholder="noreply@example.com"
            />
          </CardContent>
        </Card>

        {/* Work Schedule Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              เวลาทำการ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="เวลาเริ่มงาน"
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => updateSetting('workingHoursStart', e.target.value)}
              />
              <Input
                label="เวลาเลิกงาน"
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => updateSetting('workingHoursEnd', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันทำการ</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWorkingDay(day.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      settings.workingDays.includes(day.value)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ความเร่งด่วนเริ่มต้น
              </label>
              <select
                value={settings.defaultPriority}
                onChange={(e) => updateSetting('defaultPriority', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoAssignEnabled"
                checked={settings.autoAssignEnabled}
                onChange={(e) => updateSetting('autoAssignEnabled', e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoAssignEnabled" className="text-sm text-gray-700">
                มอบหมายงานอัตโนมัติ
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
