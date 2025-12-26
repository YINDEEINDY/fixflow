# FixFlow Development Rules

> Context Engineering configuration for Claude Code to develop FixFlow - a Maintenance Request Management System

---

## Project Overview

**FixFlow** is a full-stack maintenance request management system for organizations to track repair/maintenance requests from submission to completion.

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Vite + TailwindCSS 4 |
| **State** | Zustand + React Query (TanStack Query) |
| **Backend** | Express 5 + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT (Access + Refresh tokens) |
| **File Upload** | Cloudinary |
| **AI** | Google Generative AI (Gemini) |
| **Notifications** | Discord Bot + LINE Bot + Email (Resend) |
| **Testing** | Playwright (E2E) |

---

## Project Structure

```
fixflow/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── api/              # API client functions (axios)
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Base UI (Button, Card, Input)
│   │   │   ├── admin/       # Admin-specific components
│   │   │   ├── chat/        # AI Chat components
│   │   │   ├── layout/      # Layout components
│   │   │   └── shared/      # Shared components
│   │   ├── pages/           # Page components
│   │   │   └── admin/       # Admin pages
│   │   ├── stores/          # Zustand stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript types
│   │   ├── constants/       # Constants & enums
│   │   ├── config/          # API config
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API route definitions
│   │   ├── middlewares/     # Express middlewares
│   │   ├── config/          # Configuration
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilities (jwt, response)
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── package.json
│
├── e2e/                       # Playwright E2E tests
│   └── tests/
│
└── data/                      # Local data files
```

---

## Workflow Triggers

### Feature Development Workflow

When user requests to add a new feature, follow this workflow:

```
┌─────────────────────────────────┐
│ Phase 0: Clarification          │
│ - Ask 2-3 questions about scope │
│ - Confirm requirements          │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ Phase 1: Planning               │
│ - Identify affected files       │
│ - Plan database changes         │
│ - Plan API endpoints            │
│ - Plan UI components            │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ Phase 2: Backend Implementation │
│ - Prisma schema (if needed)     │
│ - Service layer                 │
│ - Controller                    │
│ - Routes                        │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ Phase 3: Frontend Implementation│
│ - API client                    │
│ - Components                    │
│ - Pages                         │
│ - State management              │
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│ Phase 4: Testing & Validation   │
│ - Build check                   │
│ - Type check                    │
│ - E2E tests (if applicable)     │
└─────────────────────────────────┘
```

### Bug Fix Workflow

```
1. Reproduce & understand the bug
2. Identify root cause (frontend/backend/both)
3. Fix the issue
4. Verify fix works
5. Check for side effects
```

---

## Subagent System

FixFlow uses specialized subagents for different parts of development. Each subagent has focused expertise and can be invoked for specific tasks.

### Available Subagents

| Subagent | File | Purpose |
|----------|------|---------|
| **Frontend Developer** | `.claude/agents/frontend-developer.md` | React, TailwindCSS, Zustand, React Query |
| **Backend Developer** | `.claude/agents/backend-developer.md` | Express, Prisma, API design |
| **Database Architect** | `.claude/agents/database-architect.md` | Prisma schema, migrations, optimization |
| **Fullstack Planner** | `.claude/agents/fullstack-planner.md` | Feature planning, task breakdown |

### Subagent Invocation

When working on a feature, invoke the appropriate subagent:

```
┌─────────────────────────────────────────────────────────────┐
│                    Feature Development                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Invoke: fullstack-planner                               │
│     "Plan the implementation for [feature]"                  │
│                                                              │
│  2. Invoke: database-architect (if DB changes needed)       │
│     "Design schema for [feature]"                           │
│                                                              │
│  3. Invoke: backend-developer                               │
│     "Implement backend for [feature]"                       │
│                                                              │
│  4. Invoke: frontend-developer                              │
│     "Implement frontend for [feature]"                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Parallel Execution

For large features, invoke multiple subagents in parallel:

```
┌────────────────────────────────────────────────────────────────┐
│                     Parallel Development                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  After planning is complete, run in parallel:                  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ database-       │  │ backend-        │  │ frontend-       │ │
│  │ architect       │  │ developer       │  │ developer       │ │
│  │                 │  │ (after schema)  │  │ (after API)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Subagent Prompt Examples

**Planning a new feature:**
```
Invoke fullstack-planner:
"Plan the implementation for a technician feedback system where admins
can rate technicians after job completion. Include database schema,
API endpoints, and UI components needed."
```

**Database design:**
```
Invoke database-architect:
"Design the Prisma schema for TechnicianFeedback model with relations
to Technician, Request, and User (admin). Include appropriate indexes."
```

**Backend implementation:**
```
Invoke backend-developer:
"Implement the feedback API with these endpoints:
- POST /api/feedback - Create feedback
- GET /api/feedback/technician/:id - Get feedback for technician
- GET /api/feedback/stats - Get feedback statistics
Use the patterns from existing services."
```

**Frontend implementation:**
```
Invoke frontend-developer:
"Create a FeedbackModal component that allows admins to rate technicians
(1-5 stars) with optional comment. Use React Hook Form with Zod validation.
Follow existing modal patterns in the codebase."
```

### When to Use Each Subagent

| Task | Subagent |
|------|----------|
| New feature planning | `fullstack-planner` |
| Schema changes | `database-architect` |
| New API endpoint | `backend-developer` |
| New UI component | `frontend-developer` |
| Bug in backend | `backend-developer` |
| Bug in frontend | `frontend-developer` |
| Performance optimization (DB) | `database-architect` |
| Full feature implementation | All subagents in sequence |

---

## Commands Reference

### Backend Commands

```bash
cd server

# Development
npm run dev              # Start dev server with hot reload

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Build & Lint
npm run build            # Compile TypeScript
npm run lint             # Run ESLint
npm run lint:fix         # Fix lint errors
npm run format           # Format with Prettier
```

### Frontend Commands

```bash
cd client

# Development
npm run dev              # Start Vite dev server

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Lint
npm run lint             # Run ESLint
npm run lint:fix         # Fix lint errors
npm run format           # Format with Prettier
```

### E2E Testing

```bash
cd e2e

npx playwright test      # Run all tests
npx playwright test --ui # Open test UI
```

---

## Code Patterns

### Backend Patterns

#### Controller Pattern
```typescript
// server/src/controllers/example.controller.ts
import { Request, Response, NextFunction } from 'express';
import { exampleService } from '../services/example.service.js';
import { success } from '../utils/response.js';

export const getExample = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await exampleService.getById(req.params.id);
    res.json(success(result));
  } catch (error) {
    next(error);
  }
};
```

#### Service Pattern
```typescript
// server/src/services/example.service.ts
import { db } from '../config/db.js';

class ExampleService {
  async getById(id: string) {
    return db.example.findUnique({
      where: { id },
    });
  }

  async create(data: CreateExampleInput) {
    return db.example.create({
      data,
    });
  }
}

export const exampleService = new ExampleService();
```

#### Route Pattern
```typescript
// server/src/routes/example.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import * as exampleController from '../controllers/example.controller.js';

const router = Router();

router.get('/', authenticate, exampleController.getAll);
router.get('/:id', authenticate, exampleController.getById);
router.post('/', authenticate, authorize(['admin']), exampleController.create);

export default router;
```

### Frontend Patterns

#### API Client Pattern
```typescript
// client/src/api/example.ts
import { apiClient } from './client';

export interface Example {
  id: string;
  name: string;
}

export const exampleApi = {
  getAll: () => apiClient.get<Example[]>('/example'),
  getById: (id: string) => apiClient.get<Example>(`/example/${id}`),
  create: (data: Partial<Example>) => apiClient.post<Example>('/example', data),
};
```

#### Zustand Store Pattern
```typescript
// client/src/stores/example.store.ts
import { create } from 'zustand';

interface ExampleState {
  items: Example[];
  isLoading: boolean;
  setItems: (items: Example[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  items: [],
  isLoading: false,
  setItems: (items) => set({ items }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

#### Component Pattern (with TailwindCSS)
```tsx
// client/src/components/Example.tsx
import { cn } from '../utils/cn';

interface ExampleProps {
  title: string;
  className?: string;
}

export function Example({ title, className }: ExampleProps) {
  return (
    <div className={cn('rounded-lg bg-white p-4 shadow', className)}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
  );
}
```

---

## Database Schema Reference

### Core Models

| Model | Description |
|-------|-------------|
| `User` | Users with roles (user, technician, admin) |
| `Request` | Maintenance requests |
| `Category` | Request categories (electrical, plumbing, etc.) |
| `Location` | Building/floor/room locations |
| `Technician` | Technician profiles linked to users |
| `Rating` | User ratings for completed requests |
| `Notification` | In-app notifications |
| `JobNote` | Notes added by technicians |
| `RequestLog` | Audit log for request changes |

### Enums

```prisma
enum Priority { low, normal, high, urgent }
enum RequestStatus { pending, assigned, accepted, in_progress, on_hold, completed, cancelled, rejected }
enum Role { user, technician, admin }
```

---

## API Endpoints Reference

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Requests
- `GET /api/requests` - List requests (with filters)
- `GET /api/requests/:id` - Get request details
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request
- `PATCH /api/requests/:id/status` - Update status
- `PATCH /api/requests/:id/assign` - Assign technician

### Admin
- `GET /api/admin/users` - List users
- `GET /api/admin/categories` - List categories
- `GET /api/admin/locations` - List locations
- `GET /api/admin/settings` - System settings

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/kpi` - KPI metrics

---

## Environment Variables

### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fixflow

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# AI
GEMINI_API_KEY=xxx

# Discord
DISCORD_BOT_TOKEN=xxx
DISCORD_CHANNEL_ID=xxx

# Email
RESEND_API_KEY=xxx
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_RECAPTCHA_SITE_KEY=xxx
```

---

## Coding Standards

### ALWAYS:
- Use TypeScript strict mode
- Use async/await (never raw promises with .then)
- Use Prisma for database operations
- Use Zod for validation
- Follow existing patterns in the codebase
- Use `cn()` utility for conditional classes
- Handle errors with try/catch in controllers
- Return consistent API responses with `success()` helper

### NEVER:
- Hardcode secrets or API keys
- Use `any` type (use `unknown` if needed)
- Skip error handling
- Commit .env files
- Use raw SQL (use Prisma)
- Skip TypeScript types

### File Naming Conventions
- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Routes: `*.routes.ts`
- Components: `PascalCase.tsx`
- Hooks: `use*.ts`
- Stores: `*.store.ts`
- Types: `*.ts` or `index.ts`

---

## Common Tasks

### Adding a New Feature (Full Stack)

1. **Database** (if needed):
   ```bash
   # 1. Update prisma/schema.prisma
   # 2. Generate client
   npm run db:generate
   # 3. Push to database
   npm run db:push
   ```

2. **Backend**:
   - Create `server/src/services/feature.service.ts`
   - Create `server/src/controllers/feature.controller.ts`
   - Create `server/src/routes/feature.routes.ts`
   - Register in `server/src/routes/index.ts`

3. **Frontend**:
   - Create `client/src/api/feature.ts`
   - Create components in `client/src/components/`
   - Create page in `client/src/pages/`
   - Update routing in `client/src/App.tsx`

### Adding a New API Endpoint

1. Add service method in `server/src/services/`
2. Add controller in `server/src/controllers/`
3. Add route in `server/src/routes/`
4. Add API client function in `client/src/api/`

### Adding a New Component

1. Create component file in appropriate folder
2. Use TailwindCSS for styling
3. Add TypeScript interface for props
4. Export from component file

---

## Troubleshooting

### Database Issues
```bash
# Reset database
npm run db:push --force-reset

# Regenerate Prisma client
npm run db:generate
```

### Build Errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Type Errors
```bash
# Check types without building
npx tsc --noEmit
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    FixFlow Quick Ref                     │
├─────────────────────────────────────────────────────────┤
│ Backend Dev:    cd server && npm run dev                │
│ Frontend Dev:   cd client && npm run dev                │
│ DB Studio:      cd server && npm run db:studio          │
│ Build Check:    npm run build (in both folders)         │
│ Lint Fix:       npm run lint:fix                        │
├─────────────────────────────────────────────────────────┤
│ Frontend URL:   http://localhost:5173                   │
│ Backend URL:    http://localhost:3001                   │
│ API Base:       http://localhost:3001/api               │
└─────────────────────────────────────────────────────────┘
```
