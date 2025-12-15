import fs from 'fs';
import path from 'path';

/**
 * Global Setup - รันก่อน test ทุกครั้ง
 * - Clear screenshots เก่าทิ้ง
 * - สร้าง folder ใหม่
 */
async function globalSetup() {
  const screenshotsDir = path.join(__dirname, 'screenshots');

  // ลบ folder screenshots ทั้งหมด
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
    console.log('🗑️  Cleared old screenshots');
  }

  // สร้าง folder ใหม่
  fs.mkdirSync(screenshotsDir, { recursive: true });
  fs.mkdirSync(path.join(screenshotsDir, 'flow'), { recursive: true });
  console.log('📁 Created fresh screenshots folders');
}

export default globalSetup;
