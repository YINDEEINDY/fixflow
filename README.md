# FixFlow - Maintenance Request Management System

A full-stack web application for managing maintenance requests in educational institutions or organizations.

## Features

- **User Management**: Role-based access (Admin, Technician, User)
- **Request Management**: Create, track, and manage maintenance requests
- **Status Workflow**: Pending → Accepted → In Progress → Completed (or Rejected/Cancelled)
- **Discord Integration**:
  - Webhook notifications for status updates
  - Bot integration for automatic channel creation per request
- **Dashboard**: Statistics and analytics for admins

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Lucide React (icons)

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (Railway)
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js 18+ (LTS)
- PostgreSQL database
- Discord Webhook URL (optional)

### Installation

1. Clone the repository
```bash
git clone https://github.com/YINDEEINDY/fixflow.git
cd fixflow
```

2. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

3. Setup environment variables
```bash
# server/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
```

4. Run database migrations
```bash
cd server
npx prisma migrate dev
```

5. Seed initial data (optional)
```bash
npx prisma db seed
```

6. Start development servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fixflow.com | admin123 |
| Technician | tech@fixflow.com | tech123 |
| User | user@fixflow.com | user123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create request
- `GET /api/requests/:id` - Get request by ID
- `PUT /api/requests/:id` - Update request
- `POST /api/requests/:id/accept` - Accept request
- `POST /api/requests/:id/reject` - Reject request
- `POST /api/requests/:id/cancel` - Cancel request
- `POST /api/requests/:id/start` - Start work
- `POST /api/requests/:id/complete` - Complete request

### Settings (Admin only)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/test-discord` - Test Discord webhook
- `POST /api/settings/test-discord-bot` - Test Discord bot

## License

MIT
