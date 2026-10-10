import type { Request, Response, NextFunction } from 'express';
import type { UserRole, Language } from '@prisma/client';
import { verifyAccessToken, type AuthJwtPayload } from '../lib/jwt.js';
import { AppError } from './error-handler.js';
import { prisma } from '../lib/prisma.js';

export interface AuthenticatedUser {
  id: string;
  type: 'FARMER' | 'STAFF';
  role?: UserRole | undefined;
  phone: string;
  language?: Language | undefined;
  email?: string | null | undefined;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid authorization format');
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type === 'FARMER') {
      const farmer = await prisma.farmer.findUnique({
        where: { id: payload.sub },
        select: { id: true, phone: true, isActive: true, language: true },
      });

      if (!farmer || !farmer.isActive) {
        throw new AppError(401, 'ACCOUNT_INACTIVE', 'Farmer account not found or suspended');
      }

      req.user = {
        id: farmer.id,
        type: 'FARMER',
        phone: farmer.phone,
        language: farmer.language,
      };
    } else if (payload.type === 'STAFF') {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, phone: true, email: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'ACCOUNT_INACTIVE', 'User account not found or deactivated');
      }

      req.user = {
        id: user.id,
        type: 'STAFF',
        role: user.role,
        phone: user.phone,
        email: user.email,
      };
    } else {
      throw new AppError(401, 'INVALID_TOKEN', 'Unknown token type');
    }

    next();
  } catch (err: unknown) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired');
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (req.user.type !== 'STAFF' || !req.user.role) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied: staff privileges required');
    }

    // OWNER has access to everything
    if (req.user.role === 'OWNER') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions for this operation');
    }

    next();
  };
}

export function requireFarmer(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  if (req.user.type !== 'FARMER') {
    throw new AppError(403, 'FORBIDDEN', 'Farmer privileges required');
  }

  next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.type === 'FARMER') {
      req.user = {
        id: payload.sub,
        type: 'FARMER',
        phone: payload.phone,
        language: payload.language,
      };
    } else if (payload.type === 'STAFF') {
      req.user = {
        id: payload.sub,
        type: 'STAFF',
        role: payload.role,
        phone: payload.phone,
        email: payload.email,
      };
    }
  } catch {
    // Ignore invalid token in optional auth
  }

  next();
}
