import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotsDir = path.join(__dirname, '../screenshots');

// Ensure screenshots directory exists
test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

test.describe('📸 Screenshot Tests - ให้ Claude ดู UI', () => {

  test('หน้า Login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '01-login-page.png'),
      fullPage: true
    });

    console.log('✅ Screenshot saved: 01-login-page.png');
  });

  test('หน้า Register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '02-register-page.png'),
      fullPage: true
    });

    console.log('✅ Screenshot saved: 02-register-page.png');
  });

  test('หน้า Forgot Password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '03-forgot-password.png'),
      fullPage: true
    });

    console.log('✅ Screenshot saved: 03-forgot-password.png');
  });

});

test.describe('📱 Responsive Tests', () => {

  test('Login - Mobile View (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '04-login-mobile.png'),
      fullPage: true
    });
  });

  test('Login - Tablet View (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '05-login-tablet.png'),
      fullPage: true
    });
  });

  test('Login - Desktop View (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: path.join(screenshotsDir, '06-login-desktop.png'),
      fullPage: true
    });
  });

});
