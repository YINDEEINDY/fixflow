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

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow images to be loaded cross-origin
}));
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

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
