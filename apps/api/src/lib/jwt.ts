import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { UserRole, Language } from '@prisma/client';

export interface FarmerJwtPayload {
  sub: string;
  type: 'FARMER';
  phone: string;
  language: Language;
}

export interface StaffJwtPayload {
  sub: string;
  type: 'STAFF';
  role: UserRole;
  phone: string;
  email?: string | null;
}

export type AuthJwtPayload = FarmerJwtPayload | StaffJwtPayload;

const ACCESS_SECRET = process.env['JWT_ACCESS_SECRET'] || 'dev_jwt_access_secret_32_chars_min!';
const REFRESH_SECRET = process.env['JWT_REFRESH_SECRET'] || 'dev_jwt_refresh_secret_32_chars_min!';
const ACCESS_EXPIRES_IN = process.env['JWT_ACCESS_EXPIRES_IN'] || '15m';
const REFRESH_EXPIRES_IN = process.env['JWT_REFRESH_EXPIRES_IN'] || '30d';

export function signAccessToken(payload: AuthJwtPayload): string {
  const options: jwt.SignOptions = { expiresIn: ACCESS_EXPIRES_IN as any };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function verifyAccessToken(token: string): AuthJwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as AuthJwtPayload;
}

export function signRefreshToken(userIdOrFarmerId: string): string {
  const options: jwt.SignOptions = { expiresIn: REFRESH_EXPIRES_IN as any };
  return jwt.sign({ sub: userIdOrFarmerId, kind: 'refresh' }, REFRESH_SECRET, options);
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

/**
 * Hash refresh token with SHA-256 before storing in database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
