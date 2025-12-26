import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `คุณคือ "FixFlow Assistant" ผู้ช่วย AI อัจฉริยะประจำระบบแจ้งซ่อม FixFlow ที่ฉลาด เป็นมิตร และเชี่ยวชาญทุกด้าน

🏢 เกี่ยวกับ FixFlow:
ระบบแจ้งซ่อม/บำรุงรักษาออนไลน์ที่ช่วยให้องค์กรจัดการงานซ่อมได้อย่างมีประสิทธิภาพ มี 3 บทบาท: ผู้ใช้ทั่วไป, ช่างเทคนิค, และผู้ดูแลระบบ

📱 ฟีเจอร์หลักของระบบ:

สำหรับ **ผู้ใช้ทั่วไป (User)**:
- 📝 แจ้งซ่อม: ไปที่เมนู "แจ้งซ่อม" > กรอกรายละเอียด > เลือกหมวดหมู่/สถานที่ > แนบรูป > ส่ง
- 📋 ดูรายการ: เมนู "รายการแจ้งซ่อม" ดูงานทั้งหมดที่เคยแจ้ง
- 🔔 แจ้งเตือน: ได้รับแจ้งเตือนเมื่อสถานะงานเปลี่ยน
- ⭐ ให้คะแนน: ให้คะแนนและความคิดเห็นหลังงานเสร็จ
- 👤 โปรไฟล์: แก้ไขข้อมูลส่วนตัวที่เมนู "โปรไฟล์"

สำหรับ **ช่างเทคนิค (Technician)**:
- 🔧 รับงาน: ดูงานที่ได้รับมอบหมายที่ "งานของฉัน"
- ✅ อัพเดทสถานะ: เปลี่ยนสถานะงานตามความคืบหน้า
- 📝 บันทึกงาน: เพิ่มโน้ต รูปภาพ อะไหล่ที่ใช้
- 📊 ดูสถิติ: ดูประวัติและผลงานของตัวเอง

สำหรับ **ผู้ดูแลระบบ (Admin)**:
- 👥 จัดการผู้ใช้: เพิ่ม/แก้ไข/ลบผู้ใช้และช่าง
- 📁 จัดการหมวดหมู่: ตั้งค่าประเภทงานซ่อม
- 📍 จัดการสถานที่: กำหนดอาคาร/ห้อง
- 📈 รายงาน: ดูสถิติและวิเคราะห์ข้อมูล
- ⚙️ ตั้งค่าระบบ: กำหนดค่าต่างๆ ของระบบ

📊 สถานะงาน (Status):
- 🟡 pending = รอดำเนินการ (เพิ่งแจ้ง รอมอบหมายช่าง)
- 🔵 assigned = มอบหมายแล้ว (ส่งงานให้ช่างแล้ว)
- 🟢 accepted = รับงานแล้ว (ช่างตอบรับงาน)
- 🔄 in_progress = กำลังดำเนินการ (ช่างกำลังซ่อม)
- ⏸️ on_hold = พักชั่วคราว (รออะไหล่/รอนัดหมาย)
- ✅ completed = เสร็จสิ้น (ซ่อมเรียบร้อยแล้ว)
- ❌ cancelled = ยกเลิก (ผู้แจ้งยกเลิกงาน)
- 🚫 rejected = ปฏิเสธ (ไม่สามารถดำเนินการได้)

⚡ ระดับความเร่งด่วน (Priority):
- 🟢 low = ไม่เร่งด่วน (ซ่อมได้เมื่อสะดวก)
- 🟡 normal = ปกติ (ดำเนินการตามคิว)
- 🟠 high = เร่งด่วน (ต้องการภายใน 1-2 วัน)
- 🔴 urgent = เร่งด่วนมาก (กระทบงาน ต้องซ่อมทันที!)

🎯 วิธีตอบ:
- ตอบภาษาไทย กระชับ เข้าใจง่าย
- ใช้ emoji ให้เหมาะสม
- ถ้าถามวิธีทำ → บอก step-by-step พร้อมบอกเมนูที่ต้องไป
- ถ้าถามปัญหา → วิเคราะห์และแนะนำทางแก้
- ถ้าไม่แน่ใจ → แนะนำติดต่อ Admin
- เป็นมิตร ช่วยเหลือเต็มที่

🧠 ความสามารถพิเศษ:
- วิเคราะห์ปัญหาการซ่อมเบื้องต้น
- แนะนำการเขียนรายละเอียดงานแจ้งซ่อมที่ดี
- ช่วยเลือกหมวดหมู่และระดับความเร่งด่วนที่เหมาะสม
- ให้คำแนะนำการบำรุงรักษาเชิงป้องกัน

ตอบคำถามต่อไปนี้:`;

export interface ChatContext {
  userId: string;
  userName?: string;
  userRole?: string;
  requestHistory?: {
    id: string;
    title: string;
    status: string;
    priority: string;
    createdAt: Date;
  }[];
}

export interface GeminiChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatResponse {
  message: string;
  conversationId?: string;
}

/**
 * Chat with AI using Gemini
 */
export async function chatWithAI(
  message: string,
  context?: ChatContext,
  history?: GeminiChatMessage[]
): Promise<ChatResponse> {
  try {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build context information
    let contextInfo = '';
    if (context) {
      contextInfo = `\n\nข้อมูลผู้ใช้:\n`;
      contextInfo += `- สิทธิ์: ${context.userRole || 'user'}\n`;

      if (context.requestHistory && context.requestHistory.length > 0) {
        contextInfo += `\nประวัติการแจ้งซ่อมล่าสุด (${context.requestHistory.length} รายการ):\n`;
        context.requestHistory.slice(0, 5).forEach((req, index) => {
          contextInfo += `${index + 1}. ${req.title} - สถานะ: ${req.status} - ความเร่งด่วน: ${req.priority}\n`;
        });
      }
    }

    const fullPrompt = `${SYSTEM_PROMPT}${contextInfo}\n\nคำถาม: ${message}`;

    // Use simple generateContent instead of chat
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    return {
      message: text,
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        throw new Error('AI_NOT_CONFIGURED');
      }
    }

    throw new Error('AI_SERVICE_ERROR');
  }
}

/**
 * Get user's request history for context
 */
export async function getUserRequestContext(
  userId: string
): Promise<ChatContext['requestHistory']> {
  try {
    const requests = await prisma.request.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return requests.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      priority: r.priority,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error('Error fetching user request context:', error);
    return [];
  }
}

/**
 * Save chat message to database
 */
export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  try {
    await prisma.chatMessage.create({
      data: {
        userId,
        role,
        content,
      },
    });
  } catch (error) {
    console.error('Error saving chat message:', error);
  }
}

/**
 * Get chat history from database
 */
export async function getChatHistory(userId: string, limit = 50) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return messages;
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

/**
 * Suggest category for a maintenance request using AI
 */
export interface SuggestCategoryInput {
  title: string;
  description?: string;
}

export interface SuggestCategoryResult {
  categoryId: string;
  categoryName: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export async function suggestCategory(
  input: SuggestCategoryInput
): Promise<SuggestCategoryResult | null> {
  try {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Get all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    if (categories.length === 0) {
      return null;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const categoryList = categories
      .map((c) => `- ${c.name} (${c.nameTh})`)
      .join('\n');

    const prompt = `คุณเป็นผู้เชี่ยวชาญในการจัดหมวดหมู่งานแจ้งซ่อม/บำรุงรักษา

งานแจ้งซ่อมที่ต้องจัดหมวดหมู่:
หัวข้อ: "${input.title}"
${input.description ? `รายละเอียด: "${input.description}"` : ''}

หมวดหมู่ที่มีในระบบ:
${categoryList}

กรุณาวิเคราะห์และเลือกหมวดหมู่ที่เหมาะสมที่สุด

ตอบในรูปแบบ JSON เท่านั้น (ไม่ต้องมี markdown):
{
  "categoryName": "ชื่อหมวดหมู่ภาษาอังกฤษ",
  "confidence": "high/medium/low",
  "reason": "เหตุผลสั้นๆ ภาษาไทย"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('AI response is not valid JSON:', text);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Find the category by name
    const matchedCategory = categories.find(
      (c) =>
        c.name.toLowerCase() === parsed.categoryName?.toLowerCase() ||
        c.nameTh === parsed.categoryName
    );

    if (!matchedCategory) {
      console.error('Category not found:', parsed.categoryName);
      // Return the first category as fallback with low confidence
      return {
        categoryId: categories[0].id,
        categoryName: categories[0].name,
        confidence: 'low',
        reason: 'ไม่สามารถระบุหมวดหมู่ได้ชัดเจน กรุณาเลือกด้วยตนเอง',
      };
    }

    return {
      categoryId: matchedCategory.id,
      categoryName: matchedCategory.name,
      confidence: parsed.confidence || 'medium',
      reason: parsed.reason || 'วิเคราะห์จากหัวข้อและรายละเอียด',
    };
  } catch (error) {
    console.error('Error suggesting category:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        throw new Error('AI_NOT_CONFIGURED');
      }
    }
    throw new Error('AI_SERVICE_ERROR');
  }
}
