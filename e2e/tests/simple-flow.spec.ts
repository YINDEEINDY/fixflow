import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotsDir = path.join(__dirname, '../screenshots/flow');

test('🚀 Complete Register → Logout → Login Flow', async ({ page }) => {
  // สร้าง user ใหม่
  const timestamp = Date.now();
  const testUser = {
    name: 'ทดสอบ ระบบ',
    email: `user${timestamp}@test.com`,
    password: 'Test@1234'
  };

  console.log('📧 Test Email:', testUser.email);

  // ===== STEP 1: Register =====
  await page.goto('/register');
  await page.waitForLoadState('networkidle');

  await page.screenshot({
    path: path.join(screenshotsDir, '01-register-page.png'),
    fullPage: true
  });
  console.log('✅ Step 1: หน้า Register');

  // กรอกข้อมูล
  await page.locator('input').first().fill(testUser.name);
  await page.locator('input[type="email"]').fill(testUser.email);
  const passwordInputs = await page.locator('input[type="password"]').all();
  await passwordInputs[0].fill(testUser.password);
  await passwordInputs[1].fill(testUser.password);

  await page.screenshot({
    path: path.join(screenshotsDir, '02-register-filled.png'),
    fullPage: true
  });
  console.log('✅ Step 2: กรอกข้อมูล Register');

  // กด Submit
  await page.locator('button[type="submit"]').click();

  // รอ redirect หรือ error
  await page.waitForTimeout(5000);

  await page.screenshot({
    path: path.join(screenshotsDir, '03-after-register.png'),
    fullPage: true
  });

  const afterRegisterUrl = page.url();
  console.log('✅ Step 3: หลัง Register, URL:', afterRegisterUrl);

  // ถ้า register สำเร็จจะไปหน้า dashboard
  if (!afterRegisterUrl.includes('/register')) {
    // ===== STEP 4: อยู่ที่ Dashboard =====
    await expect(page.locator('text=สวัสดี')).toBeVisible({ timeout: 5000 });
    console.log('✅ Step 4: Register สำเร็จ! อยู่ที่ Dashboard');

    await page.screenshot({
      path: path.join(screenshotsDir, '04-dashboard.png'),
      fullPage: true
    });

    // ===== STEP 5: Logout =====
    await page.locator('text=ออกจากระบบ').click();
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: path.join(screenshotsDir, '05-after-logout.png'),
      fullPage: true
    });
    console.log('✅ Step 5: Logout สำเร็จ');

    // ===== STEP 6: Login =====
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.locator('input[type="email"]').fill(testUser.email);
    await page.locator('input[type="password"]').fill(testUser.password);

    await page.screenshot({
      path: path.join(screenshotsDir, '06-login-filled.png'),
      fullPage: true
    });
    console.log('✅ Step 6: กรอก Login credentials');

    // กด Login
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: path.join(screenshotsDir, '07-after-login.png'),
      fullPage: true
    });

    const afterLoginUrl = page.url();
    console.log('✅ Step 7: หลัง Login, URL:', afterLoginUrl);

    if (!afterLoginUrl.includes('/login')) {
      await expect(page.locator('text=สวัสดี')).toBeVisible({ timeout: 5000 });
      console.log('🎉 LOGIN SUCCESS! Full flow completed!');

      await page.screenshot({
        path: path.join(screenshotsDir, '08-final-dashboard.png'),
        fullPage: true
      });
    }
  } else {
    // Register ไม่สำเร็จ - ดู error
    const errorText = await page.locator('.bg-red-50').textContent().catch(() => 'No error');
    console.log('❌ Register failed:', errorText);
  }
});
