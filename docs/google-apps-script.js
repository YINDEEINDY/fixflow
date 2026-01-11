/**
 * FixFlow - Google Form Integration Script
 *
 * วิธีใช้งาน:
 * 1. เปิด Google Form ที่ต้องการ
 * 2. คลิก ⋮ (More) > Script editor
 * 3. คัดลอกโค้ดนี้ทั้งหมดไปวาง
 * 4. แก้ไข CONFIG ด้านล่างตามระบบของคุณ
 * 5. คลิก Run > onFormSubmit เพื่อ authorize
 * 6. ตั้ง Trigger: Edit > Current project's triggers > Add trigger
 *    - Function: onFormSubmit
 *    - Event source: From form
 *    - Event type: On form submit
 * 7. Save และ Deploy
 */

// ==================== CONFIG ====================
const CONFIG = {
  // URL ของ FixFlow API
  API_URL: 'https://fixflow-xvwp.onrender.com/api',

  // API Key สำหรับ External Form
  API_KEY: '4b10988d13afbcb9f50a4b258183cafc76c90e7b35408f5949c2aea7233ba049',

  // Map ชื่อ field ใน Google Form กับ FixFlow
  // เปลี่ยนชื่อตามคำถามใน Form ของคุณ
  FIELD_MAPPING: {
    name: 'ชื่อ-นามสกุล',           // หรือ 'Name', 'ชื่อผู้แจ้ง'
    email: 'อีเมล',                // หรือ 'Email', 'E-mail'
    phone: 'เบอร์โทรศัพท์',         // หรือ 'Phone', 'เบอร์ติดต่อ'
    department: 'แผนก',            // หรือ 'Department', 'หน่วยงาน'
    title: 'หัวข้อ',               // หรือ 'Subject', 'เรื่อง', 'ปัญหาที่พบ'
    description: 'รายละเอียด',      // หรือ 'Description', 'รายละเอียดเพิ่มเติม'
    category: 'ประเภทงาน',          // หรือ 'Category', 'หมวดหมู่'
    location: 'สถานที่',           // หรือ 'Location', 'ที่ตั้ง', 'อาคาร/ชั้น/ห้อง'
    priority: 'ความเร่งด่วน',       // หรือ 'Priority', 'ลำดับความสำคัญ'
  },

  // Map ค่า priority จาก Form เป็น API
  PRIORITY_MAPPING: {
    'ปกติ': 'normal',
    'Normal': 'normal',
    'ต่ำ': 'low',
    'Low': 'low',
    'สูง': 'high',
    'High': 'high',
    'ด่วนมาก': 'urgent',
    'Urgent': 'urgent',
  },
};
// ================================================

/**
 * ฟังก์ชันหลักที่ทำงานเมื่อมีการ submit form
 */
function onFormSubmit(e) {
  try {
    // ดึงข้อมูลจาก form response
    const itemResponses = e.response.getItemResponses();
    const formData = {};

    // แปลง response เป็น object
    itemResponses.forEach(function(itemResponse) {
      const title = itemResponse.getItem().getTitle();
      const answer = itemResponse.getResponse();
      formData[title] = answer;
    });

    console.log('Form Data:', JSON.stringify(formData));

    // Map ข้อมูลตาม config
    const mapping = CONFIG.FIELD_MAPPING;
    const requestData = {
      name: formData[mapping.name] || 'ไม่ระบุชื่อ',
      email: formData[mapping.email] || undefined,
      phone: formData[mapping.phone] || undefined,
      department: formData[mapping.department] || undefined,
      title: formData[mapping.title] || 'แจ้งซ่อมจาก Google Form',
      description: formData[mapping.description] || undefined,
      categoryName: formData[mapping.category] || 'อื่นๆ',
      locationName: formData[mapping.location] || 'ไม่ระบุ',
      priority: mapPriority(formData[mapping.priority]),
    };

    console.log('Request Data:', JSON.stringify(requestData));

    // ส่งข้อมูลไป FixFlow API
    const result = sendToFixFlow(requestData);
    console.log('API Result:', JSON.stringify(result));

    // (Optional) ส่ง email แจ้งผลกลับผู้ submit
    if (requestData.email && result.success) {
      sendConfirmationEmail(requestData.email, result.data.requestNumber);
    }

  } catch (error) {
    console.error('Error in onFormSubmit:', error);
    // Log error for debugging
    logError(error, e);
  }
}

/**
 * ส่งข้อมูลไป FixFlow API
 */
function sendToFixFlow(data) {
  const url = CONFIG.API_URL + '/external-form/submit';

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'X-API-Key': CONFIG.API_KEY,
    },
    payload: JSON.stringify(data),
    muteHttpExceptions: true, // ไม่ throw error เมื่อ response ไม่ใช่ 2xx
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  console.log('Response Code:', responseCode);
  console.log('Response Body:', responseBody);

  if (responseCode >= 200 && responseCode < 300) {
    return JSON.parse(responseBody);
  } else {
    console.error('API Error:', responseCode, responseBody);
    return { success: false, error: responseBody };
  }
}

/**
 * Map priority จากภาษาไทย/อังกฤษ เป็น API format
 */
function mapPriority(value) {
  if (!value) return 'normal';
  return CONFIG.PRIORITY_MAPPING[value] || 'normal';
}

/**
 * ส่ง email ยืนยันกลับผู้ submit (optional)
 */
function sendConfirmationEmail(email, requestNumber) {
  try {
    const subject = 'ยืนยันการรับแจ้งซ่อม - ' + requestNumber;
    const body = 'ขอบคุณสำหรับการแจ้งซ่อม\n\n' +
                 'หมายเลขคำร้อง: ' + requestNumber + '\n\n' +
                 'คุณสามารถติดตามสถานะได้ที่ระบบ FixFlow\n\n' +
                 '-- ระบบแจ้งซ่อมอัตโนมัติ --';

    MailApp.sendEmail(email, subject, body);
    console.log('Confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

/**
 * Log error สำหรับ debugging
 */
function logError(error, event) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  if (sheet) {
    const logSheet = sheet.getSheetByName('ErrorLog') || sheet.insertSheet('ErrorLog');
    logSheet.appendRow([
      new Date(),
      error.toString(),
      JSON.stringify(event),
    ]);
  }
}

/**
 * ฟังก์ชันทดสอบ - เรียกด้วยมือเพื่อทดสอบ API connection
 */
function testAPIConnection() {
  const testData = {
    name: 'ทดสอบ ระบบ',
    email: 'test@example.com',
    phone: '0812345678',
    title: 'ทดสอบการเชื่อมต่อ Google Form',
    description: 'นี่คือการทดสอบการส่งข้อมูลจาก Google Apps Script',
    categoryName: 'ไฟฟ้า',
    locationName: 'อาคาร A ชั้น 1',
    priority: 'normal',
  };

  console.log('Testing API connection...');
  const result = sendToFixFlow(testData);
  console.log('Test Result:', JSON.stringify(result));

  if (result.success) {
    console.log('SUCCESS! Request Number:', result.data.requestNumber);
  } else {
    console.log('FAILED:', result.error);
  }

  return result;
}

/**
 * ดึงรายการ Categories จาก API (สำหรับตั้ง dropdown ใน Form)
 */
function getCategories() {
  const url = CONFIG.API_URL + '/external-form/categories';
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());

  if (data.success) {
    console.log('Categories:');
    data.data.forEach(function(cat) {
      console.log('- ' + cat.nameTh + ' (' + cat.name + ')');
    });
  }

  return data;
}

/**
 * ดึงรายการ Locations จาก API (สำหรับตั้ง dropdown ใน Form)
 */
function getLocations() {
  const url = CONFIG.API_URL + '/external-form/locations';
  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());

  if (data.success) {
    console.log('Locations:');
    data.data.forEach(function(loc) {
      const name = loc.building + ' ' + (loc.floor || '') + ' ' + (loc.room || '');
      console.log('- ' + name.trim());
    });
  }

  return data;
}
