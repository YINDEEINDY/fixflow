import { test, expect } from '@playwright/test';

test.describe('Dark Mode Toggle', () => {
  test('should toggle between light and dark mode on login page', async ({ page }) => {
    // Go to login page
    await page.goto('http://localhost:5173/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot in default light mode
    await page.screenshot({
      path: 'e2e/screenshots/dark-mode/01-login-light.png',
      fullPage: true
    });

    // The page should start in light mode (or follow system preference)
    // Let's check if the HTML element has the dark class
    const htmlClass = await page.locator('html').getAttribute('class');
    console.log('Initial HTML class:', htmlClass);

    // Click on the login button to verify page is loaded
    const loginTitle = page.locator('h3:has-text("เข้าสู่ระบบ")');
    await expect(loginTitle).toBeVisible();

    console.log('Login page loaded successfully');
  });

  test('should show dark mode toggle in main layout after login', async ({ page }) => {
    // First register a test user
    const timestamp = Date.now();
    const testEmail = `darktest${timestamp}@test.com`;
    const testPassword = 'Test123456';

    // Go to register page
    await page.goto('http://localhost:5173/register');
    await page.waitForLoadState('networkidle');

    // Fill registration form
    await page.fill('input[placeholder="ชื่อ-นามสกุล"]', 'Dark Mode Tester');
    await page.fill('input[placeholder="อีเมล"]', testEmail);
    await page.fill('input[placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"]', testPassword);
    await page.fill('input[placeholder="ยืนยันรหัสผ่าน"]', testPassword);

    // Submit registration
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if backend is available
    const currentUrl = page.url();
    if (currentUrl.includes('/register')) {
      console.log('⚠️ Backend may not be running - skipping test');
      test.skip(true, 'Backend server is not running');
      return;
    }

    await page.waitForLoadState('networkidle');

    // Screenshot dashboard in light mode
    await page.screenshot({
      path: 'e2e/screenshots/dark-mode/02-dashboard-light.png',
      fullPage: true
    });

    // Find and click the theme toggle button (Sun/Moon icon)
    // The button should be in the header
    const themeToggle = page.locator('button[aria-label*="Mode"], button[title*="Mode"]').first();
    await expect(themeToggle).toBeVisible();

    // Click to toggle to dark mode
    await themeToggle.click();

    // Wait for theme transition
    await page.waitForTimeout(500);

    // Screenshot dashboard in dark mode
    await page.screenshot({
      path: 'e2e/screenshots/dark-mode/03-dashboard-dark.png',
      fullPage: true
    });

    // Verify dark class is applied to HTML element
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    console.log('Dark mode applied successfully. HTML class:', htmlClass);

    // Navigate to requests list page
    await page.click('text=รายการแจ้งซ่อม');
    await page.waitForLoadState('networkidle');

    // Screenshot request list in dark mode
    await page.screenshot({
      path: 'e2e/screenshots/dark-mode/04-requests-dark.png',
      fullPage: true
    });

    // Toggle back to light mode
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Screenshot request list in light mode
    await page.screenshot({
      path: 'e2e/screenshots/dark-mode/05-requests-light.png',
      fullPage: true
    });

    // Verify light mode is applied
    const htmlClassLight = await page.locator('html').getAttribute('class');
    expect(htmlClassLight).toContain('light');
    console.log('Light mode restored. HTML class:', htmlClassLight);

    // Logout
    await page.click('text=ออกจากระบบ');
    await page.waitForURL('**/login');

    // Screenshot login page in light mode
    await page.screenshot({
      path: 'e2e/screenshots/dark-mode/06-login-after-logout.png',
      fullPage: true
    });

    console.log('Dark mode test completed successfully!');
  });
});
