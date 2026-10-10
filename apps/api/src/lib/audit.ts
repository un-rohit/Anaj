import type { Prisma } from '@prisma/client';
import { prisma } from './prisma.js';
import { logger } from './logger.js';

export interface AuditLogParams {
  actorId?: string | null;
  actorType: 'USER' | 'SYSTEM' | 'FARMER';
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Safely sanitizes sensitive fields before persisting in audit logs
 */
function sanitizeAuditPayload(data: unknown): Prisma.InputJsonValue | undefined {
  if (data === undefined || data === null) {
    return undefined;
  }
  try {
    const serialized = JSON.stringify(data, (key, value) => {
      // Never log sensitive credentials
      if (['password', 'passwordHash', 'otp', 'otpHash', 'token', 'refreshToken'].includes(key)) {
        return '[REDACTED]';
      }
      return value;
    });
    return JSON.parse(serialized) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const data: Prisma.AuditLogCreateInput = {
      actorType: params.actorType,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
    };

    if (params.actorId) {
      data.actor = { connect: { id: params.actorId } };
    }

    const beforeVal = sanitizeAuditPayload(params.before);
    if (beforeVal !== undefined) {
      data.before = beforeVal;
    }

    const afterVal = sanitizeAuditPayload(params.after);
    if (afterVal !== undefined) {
      data.after = afterVal;
    }

    if (params.ipAddress) {
      data.ipAddress = params.ipAddress;
    }

    if (params.userAgent) {
      data.userAgent = params.userAgent;
    }

    await prisma.auditLog.create({ data });
  } catch (err: unknown) {
    // Non-blocking error for audit log so main transaction succeeds
    logger.error({ err, params: { ...params, before: undefined, after: undefined } }, 'Failed to write audit log');
  }
}
