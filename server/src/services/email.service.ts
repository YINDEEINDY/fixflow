import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.log('[Email Service] Resend not configured. Email would be sent to:', options.to);
    console.log('[Email Service] Subject:', options.subject);
    return true;
  }

  try {
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM || 'FixFlow <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[Email Service] Failed to send email:', error);
      return false;
    }

    console.log('[Email Service] Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName: string
): Promise<boolean> {
  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>รีเซ็ตรหัสผ่าน - FixFlow</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">FixFlow</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">ระบบแจ้งซ่อม/บำรุงรักษา</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">สวัสดี ${userName}</h2>
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
              เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณากดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
            </p>

            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                รีเซ็ตรหัสผ่าน
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0;">
              หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:
            </p>
            <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 13px; color: #4b5563; margin: 0 0 20px 0;">
              ${resetUrl}
            </p>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยอีเมลนี้
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              อีเมลนี้ส่งจากระบบ FixFlow โดยอัตโนมัติ กรุณาอย่าตอบกลับ
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'รีเซ็ตรหัสผ่าน - FixFlow',
    html,
  });
}
