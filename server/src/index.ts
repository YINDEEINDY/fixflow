import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app = express();

// LINE Webhook - MUST be before any middleware to allow LINE servers
app.post('/api/line/webhook', express.json(), (req, res) => {
  console.log('=== LINE Webhook Event ===');
  console.log(JSON.stringify(req.body, null, 2));

  const events = req.body?.events || [];
  for (const event of events) {
    if (event.source?.groupId) {
      console.log('');
      console.log('========================================');
      console.log('🎉 GROUP ID FOUND:', event.source.groupId);
      console.log('========================================');
      console.log('');
    }
    if (event.source?.roomId) {
      console.log('ROOM ID FOUND:', event.source.roomId);
    }
    if (event.source?.userId) {
      console.log('USER ID:', event.source.userId);
    }
  }

  res.status(200).json({ status: 'ok' });
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be loaded cross-origin
  })
);

// Parse CORS origins (supports comma-separated list)
const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Health check (before routes - no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', routes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     FixFlow Server Started Successfully    ║
  ╠═══════════════════════════════════════════╣
  ║  Mode:    ${env.NODE_ENV.padEnd(30)}║
  ║  Port:    ${PORT.toString().padEnd(30)}║
  ║  API:     http://localhost:${PORT}/api${' '.repeat(14)}║
  ╚═══════════════════════════════════════════╝
  `);
});

export default app;


