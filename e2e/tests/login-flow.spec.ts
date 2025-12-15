import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotsDir = path.join(__dirname, '../screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test.describe('🔐 Login Flow Tests', () => {

  test('ทดสอบ Login ด้วย credentials ผิด', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // กรอก email ผิด
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');

    // ถ่ายรูปก่อนกด submit
    await page.screenshot({
      path: path.join(screenshotsDir, 'login-01-filled-form.png'),
      fullPage: true
    });

    // กดปุ่ม Login
    await page.click('button[type="submit"]');

    // รอ response
    await page.waitForTimeout(2000);

    // ถ่ายรูปหลังกด submit (ควรเห็น error message)
    await page.screenshot({
      path: path.join(screenshotsDir, 'login-02-error-response.png'),
      fullPage: true
    });

    console.log('✅ Login error flow tested');
  });

  test('ทดสอบ Validation - Email format ผิด', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // กรอก email ผิด format
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.fill('input[type="password"], input[name="password"]', '123');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, 'login-03-validation-error.png'),
      fullPage: true
    });
  });

  test('ทดสอบ Empty form submission', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // กด submit โดยไม่กรอกอะไร
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, 'login-04-empty-form.png'),
      fullPage: true
    });
  });

});

test.describe('📝 Register Flow Tests', () => {

  test('ทดสอบ Register form validation', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // ถ่ายรูป form ว่าง
    await page.screenshot({
      path: path.join(screenshotsDir, 'register-01-empty.png'),
      fullPage: true
    });

    // กรอกข้อมูลบางส่วน
    await page.fill('input[name="name"], input[placeholder*="ชื่อ"]', 'Test User');
    await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'short');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // ถ่ายรูป validation errors
    await page.screenshot({
      path: path.join(screenshotsDir, 'register-02-validation.png'),
      fullPage: true
    });
  });

  test('ทดสอบ Password mismatch', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // กรอก password ไม่ตรงกัน
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill('password123');
      await passwordInputs[1].fill('differentpassword');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, 'register-03-password-mismatch.png'),
      fullPage: true
    });
  });

});
