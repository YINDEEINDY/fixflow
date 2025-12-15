import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotsDir = path.join(__dirname, '../screenshots/flow');

// สร้าง user ใหม่ทุกครั้ง
const timestamp = Date.now();
const testUser = {
  name: 'ทดสอบ ระบบ',
  email: `testuser${timestamp}@example.com`,
  password: 'Test@1234',
  phone: '0812345678',
  department: 'IT Department'
};

test.describe.serial('🚀 Full Registration → Login Flow', () => {

  test('Step 1: เปิดหน้า Register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '01-register-page.png'),
      fullPage: true
    });

    await expect(page.locator('h3:has-text("สร้างบัญชีใหม่")')).toBeVisible();
    console.log('✅ Step 1: หน้า Register โหลดสำเร็จ');
  });

  test('Step 2: กรอกข้อมูล Registration และ Submit', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // กรอกชื่อ
    await page.locator('input').first().fill(testUser.name);

    // กรอก Email
    await page.locator('input[type="email"]').fill(testUser.email);

    // กรอก Password
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(testUser.password);
    await passwordInputs[1].fill(testUser.password);

    await page.screenshot({
      path: path.join(screenshotsDir, '02-register-filled.png'),
      fullPage: true
    });

    console.log('✅ Step 2: กรอกข้อมูลครบ');
    console.log(`   📧 Email: ${testUser.email}`);
    console.log(`   🔑 Password: ${testUser.password}`);

    // กดปุ่ม Register
    await page.locator('button[type="submit"]').click();

    // รอ redirect ไป dashboard
    await page.waitForURL('**/', { timeout: 10000 });

    await page.screenshot({
      path: path.join(screenshotsDir, '03-after-register-dashboard.png'),
      fullPage: true
    });

    const currentUrl = page.url();
    console.log('✅ Register สำเร็จ! Auto-login แล้ว');
    console.log(`   📍 URL: ${currentUrl}`);

    // เช็คว่าอยู่ที่ dashboard
    await expect(page.locator('text=สวัสดี')).toBeVisible();
  });

  test('Step 3: Logout แล้ว Login ใหม่', async ({ page }) => {
    // ไป dashboard ก่อน (ต้อง register ใหม่เพราะ test แยก context)
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // Register user ใหม่
    const newEmail = `testuser${Date.now()}@example.com`;
    await page.locator('input').first().fill(testUser.name);
    await page.locator('input[type="email"]').fill(newEmail);
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(testUser.password);
    await passwordInputs[1].fill(testUser.password);
    await page.locator('button[type="submit"]').click();

    // รอ redirect ไป dashboard
    await page.waitForURL('**/', { timeout: 10000 });

    await page.screenshot({
      path: path.join(screenshotsDir, '04-logged-in-dashboard.png'),
      fullPage: true
    });

    // กด Logout
    await page.locator('text=ออกจากระบบ').click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, '05-after-logout.png'),
      fullPage: true
    });

    console.log('✅ Step 3: Logout สำเร็จ');

    // ไปหน้า Login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '06-login-page.png'),
      fullPage: true
    });

    // กรอก credentials
    await page.locator('input[type="email"]').fill(newEmail);
    await page.locator('input[type="password"]').fill(testUser.password);

    await page.screenshot({
      path: path.join(screenshotsDir, '07-login-filled.png'),
      fullPage: true
    });

    // กด Login
    await page.locator('button[type="submit"]').click();

    // รอ redirect
    await page.waitForURL('**/', { timeout: 10000 });

    await page.screenshot({
      path: path.join(screenshotsDir, '08-login-success-dashboard.png'),
      fullPage: true
    });

    console.log('✅ Login สำเร็จ!');
    console.log(`   📧 Email: ${newEmail}`);

    // เช็คว่า login สำเร็จ
    await expect(page.locator('text=สวัสดี')).toBeVisible();
  });

  test('Step 4: ทดสอบสร้างคำขอแจ้งซ่อมใหม่', async ({ page }) => {
    // Register และ Login
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const newEmail = `testuser${Date.now()}@example.com`;
    await page.locator('input').first().fill(testUser.name);
    await page.locator('input[type="email"]').fill(newEmail);
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(testUser.password);
    await passwordInputs[1].fill(testUser.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/', { timeout: 10000 });

    // กดปุ่ม "แจ้งซ่อมใหม่"
    await page.locator('text=แจ้งซ่อมใหม่').click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: path.join(screenshotsDir, '09-create-request-page.png'),
      fullPage: true
    });

    console.log('✅ Step 4: หน้าสร้างคำขอแจ้งซ่อม');
  });

});
