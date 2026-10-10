import 'dotenv/config';
import { app } from './app.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const PORT = parseInt(process.env['PORT'] ?? '4000', 10);

async function start() {
  try {
    // Verify database connection before accepting traffic
    await prisma.$connect();
    logger.info('Database connected');

    const server = app.listen(PORT, () => {
      logger.info({ port: PORT, env: process.env['NODE_ENV'] }, 'ANAJ API started');
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info({ signal }, 'Shutdown signal received');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Server closed');
        process.exit(0);
      });
      // Force kill after 10s if connections don't close
      setTimeout(() => process.exit(1), 10_000).unref();
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

void start();
