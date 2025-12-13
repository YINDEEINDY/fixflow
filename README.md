# FixFlow - ระบบแจ้งซ่อม/บำรุงรักษา

ระบบแจ้งซ่อม/บำรุงรักษาออนไลน์ที่ช่วยให้องค์กร สถานศึกษา และหน่วยงานต่างๆ สามารถจัดการงานซ่อมบำรุงได้อย่างมีประสิทธิภาพ

## Features

- **User**: แจ้งซ่อม, ติดตามสถานะ, ให้คะแนน
- **Technician**: รับงาน, อัปเดตสถานะ, บันทึกการซ่อม
- **Admin**: จัดการผู้ใช้, มอบหมายงาน, ดูรายงาน
- **Notifications**: แจ้งเตือนผ่าน LINE และ In-app
- **Real-time**: อัปเดตสถานะแบบ real-time

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- TanStack Query
- Zustand

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or use Railway/Supabase)

### Installation

1. Clone repository
```bash
git clone <repo-url>
cd fixflow
```

2. Setup Server
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

3. Setup Client
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### Environment Variables

#### Server (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
LINE_CHANNEL_ID=""
LINE_CHANNEL_SECRET=""
```

#### Client (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_LINE_CHANNEL_ID=
```

## Test Accounts

After running seed:
- **Admin**: admin@fixflow.com / admin123
- **Technician**: tech@fixflow.com / tech123
- **User**: user@fixflow.com / user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/line` - LINE Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Requests (Coming soon)
- `GET /api/requests` - List requests
- `POST /api/requests` - Create request
- `GET /api/requests/:id` - Get request detail
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Cancel request

## License

MIT
