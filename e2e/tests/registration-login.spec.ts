import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotsDir = path.join(__dirname, '../screenshots/flow');

// สร้าง email unique ด้วย timestamp
const timestamp = Date.now();
const testUser = {
  name: 'ทดสอบ ระบบ',
  email: `test${timestamp}@example.com`,
  password: 'Test@1234',
  phone: '0812345678',
  department: 'IT Department'
};

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test.describe.serial('🔄 Registration → Login Flow', () => {

  test('Step 1: เปิดหน้า Register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '01-register-empty.png'),
      fullPage: true
    });

    console.log('📸 Step 1: หน้า Register ว่างๆ');
  });

  test('Step 2: กรอกข้อมูล Registration', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // กรอกชื่อ
    const nameInput = page.locator('input[name="name"], input[placeholder*="ชื่อ"]').first();
    await nameInput.fill(testUser.name);

    // กรอก Email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testUser.email);

    // กรอก Password
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 1) {
      await passwordInputs[0].fill(testUser.password);
    }

    // กรอก Confirm Password
    if (passwordInputs.length >= 2) {
      await passwordInputs[1].fill(testUser.password);
    }

    // กรอกเบอร์โทร (optional)
    const phoneInput = page.locator('input[name="phone"], input[placeholder*="เบอร์"], input[type="tel"]').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(testUser.phone);
    }

    // กรอกแผนก (optional)
    const deptInput = page.locator('input[name="department"], input[placeholder*="แผนก"], input[placeholder*="หน่วยงาน"]').first();
    if (await deptInput.isVisible()) {
      await deptInput.fill(testUser.department);
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '02-register-filled.png'),
      fullPage: true
    });

    console.log('📸 Step 2: กรอกข้อมูลครบแล้ว');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Password: ${testUser.password}`);
  });

  test('Step 3: กดปุ่ม Register และดูผลลัพธ์', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    // กรอกข้อมูลใหม่
    const nameInput = page.locator('input[name="name"], input[placeholder*="ชื่อ"]').first();
    await nameInput.fill(testUser.name);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testUser.email);

    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 1) await passwordInputs[0].fill(testUser.password);
    if (passwordInputs.length >= 2) await passwordInputs[1].fill(testUser.password);

    // ถ่ายรูปก่อนกด submit
    await page.screenshot({
      path: path.join(screenshotsDir, '03-before-submit.png'),
      fullPage: true
    });

    // กดปุ่ม Register
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // รอ response
    await page.waitForTimeout(3000);

    // ถ่ายรูปหลังกด submit
    await page.screenshot({
      path: path.join(screenshotsDir, '04-after-register.png'),
      fullPage: true
    });

    console.log('📸 Step 3: กด Register แล้ว - ดูผลลัพธ์');
  });

  test('Step 4: ไปหน้า Login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '05-login-page.png'),
      fullPage: true
    });

    console.log('📸 Step 4: หน้า Login');
  });

  test('Step 5: กรอก credentials และ Login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // กรอก Email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testUser.email);

    // กรอก Password
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testUser.password);

    await page.screenshot({
      path: path.join(screenshotsDir, '06-login-filled.png'),
      fullPage: true
    });

    console.log('📸 Step 5: กรอก Login credentials');
  });

  test('Step 6: กดปุ่ม Login และดูผลลัพธ์', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // กรอกข้อมูล
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill(testUser.email);

    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await passwordInput.fill(testUser.password);

    // กดปุ่ม Login
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // รอ response และ redirect
    await page.waitForTimeout(3000);

    // ถ่ายรูปหลัง Login
    await page.screenshot({
      path: path.join(screenshotsDir, '07-after-login.png'),
      fullPage: true
    });

    // เช็ค URL ว่า redirect ไปไหน
    const currentUrl = page.url();
    console.log('📸 Step 6: หลัง Login');
    console.log(`   Current URL: ${currentUrl}`);
  });

});
