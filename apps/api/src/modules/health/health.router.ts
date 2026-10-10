import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'anaj-api',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch {
    res.status(503).json({
      status: 'degraded',
      service: 'anaj-api',
      timestamp: new Date().toISOString(),
      db: 'disconnected',
    });
  }
});
