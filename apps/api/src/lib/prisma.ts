import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger.js';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Reuse client across hot-reload cycles in development
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  });

if (process.env['NODE_ENV'] !== 'production') {
  global.__prisma = prisma;
  // Log slow queries in development
  (prisma as unknown as { $on: (event: 'query', cb: (e: Prisma.QueryEvent) => void) => void }).$on(
    'query',
    (e: Prisma.QueryEvent) => {
      if (e.duration > 200) {
        logger.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
      }
    }
  );
}
