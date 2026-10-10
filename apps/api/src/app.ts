import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { requestId } from './middleware/request-id.js';
import { healthRouter } from './modules/health/health.router.js';

const app = express();

// ---------------------------------------------------------------------------
// Security headers
// ---------------------------------------------------------------------------
app.use(helmet());

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const allowedOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  }),
);

// ---------------------------------------------------------------------------
// Request parsing & compression
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ---------------------------------------------------------------------------
// Correlation IDs & logging
// ---------------------------------------------------------------------------
app.use(requestId);
app.use(
  morgan('combined', {
    skip: (req) => req.url === '/health',
  }),
);

// ---------------------------------------------------------------------------
// Global rate limiting
// ---------------------------------------------------------------------------
app.use(
  rateLimit({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '60000', 10),
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] ?? '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
  }),
);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/health', healthRouter);

// All API routes are versioned under /api/v1
// Additional routers added in Phase 2:
// app.use('/api/v1/auth', authRouter);
// app.use('/api/v1/farmers', farmerRouter);
// app.use('/api/v1/products', productRouter);
// app.use('/api/v1/rates', rateRouter);
// app.use('/api/v1/sell-requests', sellRequestRouter);
// ... etc.

// ---------------------------------------------------------------------------
// 404 and error handling (must be last)
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

export { app };
