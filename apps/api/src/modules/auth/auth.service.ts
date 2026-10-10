import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error-handler.js';
import { sendOtpSms } from '../../lib/sms.js';
import {
  signAccessToken,
  signRefreshToken,
  hashToken,
  verifyRefreshToken,
  type FarmerJwtPayload,
  type StaffJwtPayload,
} from '../../lib/jwt.js';
import type { AuthenticatedUser } from '../../middleware/auth.js';
import { logAudit } from '../../lib/audit.js';

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

export class AuthService {
  /**
   * Request an OTP for a farmer's mobile phone
   */
  async sendFarmerOtp(phone: string): Promise<{ success: boolean; message: string; expiresInMinutes: number }> {
    // 1. Rate-limiting check: count OTP requests within last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000);
    const recentCount = await prisma.otpRecord.count({
      where: {
        phone,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentCount >= 5) {
      throw new AppError(
        429,
        'OTP_RATE_LIMITED',
        'Too many OTP requests. Please wait a few minutes before trying again.',
      );
    }

    // 2. Generate secure 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // 3. Hash OTP before storage
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.otpRecord.create({
      data: {
        phone,
        otpHash,
        expiresAt,
      },
    });

    // 4. Send SMS
    const smsResult = await sendOtpSms(phone, otp);
    if (!smsResult.success) {
      throw new AppError(500, 'SMS_DELIVERY_FAILED', 'Failed to dispatch OTP SMS. Please try again.');
    }

    return {
      success: true,
      message: 'OTP has been dispatched to your mobile number',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    };
  }

  /**
   * Verify farmer OTP and return session tokens
   */
  async verifyFarmerOtp(
    phone: string,
    otp: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    isNewUser: boolean;
    farmer: {
      id: string;
      phone: string;
      name: string;
      language: string;
      isVerified: boolean;
    };
  }> {
    // 1. Find the latest valid OTP record for this phone
    const record = await prisma.otpRecord.findFirst({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new AppError(400, 'INVALID_OTP', 'No active OTP found. Please request a new OTP.');
    }

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AppError(400, 'OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Increment attempt counter
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });

    // Compare with bcrypt
    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) {
      throw new AppError(400, 'INVALID_OTP', 'Incorrect OTP. Please enter the valid code.');
    }

    // Mark OTP as used
    await prisma.otpRecord.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    // 2. Find or register farmer
    let farmer = await prisma.farmer.findUnique({
      where: { phone },
    });

    let isNewUser = false;
    if (!farmer) {
      isNewUser = true;
      farmer = await prisma.farmer.create({
        data: {
          phone,
          name: `किसान ${phone.slice(-4)}`,
          language: 'HI',
          isActive: true,
        },
      });

      await logAudit({
        actorId: farmer.id,
        actorType: 'FARMER',
        action: 'FARMER_REGISTERED',
        entityType: 'Farmer',
        entityId: farmer.id,
        after: { phone: farmer.phone, language: farmer.language },
      });
    }

    if (!farmer.isActive) {
      throw new AppError(403, 'ACCOUNT_SUSPENDED', 'Your farmer account is suspended. Please contact customer support.');
    }

    // 3. Issue JWT tokens
    const payload: FarmerJwtPayload = {
      sub: farmer.id,
      type: 'FARMER',
      phone: farmer.phone,
      language: farmer.language,
    };

    const accessToken = signAccessToken(payload);
    const rawRefreshToken = signRefreshToken(farmer.id);
    const hashedRefresh = hashToken(rawRefreshToken);

    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await prisma.refreshToken.create({
      data: {
        token: hashedRefresh,
        farmerId: farmer.id,
        expiresAt: refreshExpiry,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      isNewUser,
      farmer: {
        id: farmer.id,
        phone: farmer.phone,
        name: farmer.name,
        language: farmer.language,
        isVerified: farmer.isVerified,
      },
    };
  }

  /**
   * Authenticate staff/admin using email or phone + password
   */
  async staffLogin(
    identifier: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string | null;
      phone: string;
      role: string;
      language: string;
    };
  }> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email/phone or password');
    }

    if (!user.isActive) {
      throw new AppError(403, 'ACCOUNT_DEACTIVATED', 'Staff account is deactivated. Contact the administrator.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email/phone or password');
    }

    const payload: StaffJwtPayload = {
      sub: user.id,
      type: 'STAFF',
      role: user.role,
      phone: user.phone,
      email: user.email,
    };

    const accessToken = signAccessToken(payload);
    const rawRefreshToken = signRefreshToken(user.id);
    const hashedRefresh = hashToken(rawRefreshToken);

    const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: hashedRefresh,
        userId: user.id,
        expiresAt: refreshExpiry,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language: user.language,
      },
    };
  }

  /**
   * Refresh an expired access token using a valid refresh token
   */
  async refreshAccessToken(refreshTokenStr: string): Promise<{ accessToken: string }> {
    try {
      verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is expired or malformed');
    }

    const hashed = hashToken(refreshTokenStr);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: hashed },
    });

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is revoked or expired');
    }

    if (tokenRecord.farmerId) {
      const farmer = await prisma.farmer.findUnique({
        where: { id: tokenRecord.farmerId },
      });
      if (!farmer || !farmer.isActive) {
        throw new AppError(401, 'ACCOUNT_INACTIVE', 'Farmer account inactive');
      }
      const accessToken = signAccessToken({
        sub: farmer.id,
        type: 'FARMER',
        phone: farmer.phone,
        language: farmer.language,
      });
      return { accessToken };
    }

    if (tokenRecord.userId) {
      const user = await prisma.user.findUnique({
        where: { id: tokenRecord.userId },
      });
      if (!user || !user.isActive) {
        throw new AppError(401, 'ACCOUNT_INACTIVE', 'Staff account inactive');
      }
      const accessToken = signAccessToken({
        sub: user.id,
        type: 'STAFF',
        role: user.role,
        phone: user.phone,
        email: user.email,
      });
      return { accessToken };
    }

    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Token owner not found');
  }

  /**
   * Revoke refresh token on logout
   */
  async logout(refreshTokenStr: string): Promise<void> {
    const hashed = hashToken(refreshTokenStr);
    await prisma.refreshToken.updateMany({
      where: { token: hashed },
      data: { isRevoked: true },
    });
  }

  /**
   * Fetch current authenticated session details
   */
  async getMe(authUser: AuthenticatedUser) {
    if (authUser.type === 'FARMER') {
      const farmer = await prisma.farmer.findUnique({
        where: { id: authUser.id },
        include: { address: true },
      });
      if (!farmer) {
        throw new AppError(404, 'NOT_FOUND', 'Farmer profile not found');
      }
      return { type: 'FARMER', profile: farmer };
    } else {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          language: true,
          isActive: true,
          createdAt: true,
        },
      });
      if (!user) {
        throw new AppError(404, 'NOT_FOUND', 'Staff profile not found');
      }
      return { type: 'STAFF', profile: user };
    }
  }
}

export const authService = new AuthService();
