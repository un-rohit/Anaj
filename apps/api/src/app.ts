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

import { authRouter } from './modules/auth/auth.router.js';
import { farmerRouter } from './modules/farmers/farmer.router.js';
import { productRouter } from './modules/products/product.router.js';
import { purchaseRateRouter } from './modules/purchase-rates/purchase-rate.router.js';
import { sellRequestRouter } from './modules/sell-requests/sell-request.router.js';
import { companyRouter } from './modules/company/company.router.js';
import { auditLogRouter } from './modules/audit-logs/audit-log.router.js';
import { dashboardRouter } from './modules/dashboard/dashboard.router.js';
import { openApiSpec } from './lib/openapi.js';

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/health', healthRouter);

// Versioned API routes under /api/v1
app.get('/api/v1/openapi.json', (_req, res) => {
  res.json(openApiSpec);
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/farmers', farmerRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/purchase-rates', purchaseRateRouter);
app.use('/api/v1/sell-requests', sellRequestRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/audit-logs', auditLogRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// ---------------------------------------------------------------------------
// 404 and error handling (must be last)
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

export { app };
