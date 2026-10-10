import { Router } from 'express';
import { z } from 'zod';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from '@anaj/shared-validation';

const authRouter = Router();

const staffLoginSchema = z.object({
  identifier: z.string().trim().min(3, 'Email or phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

// Farmer OTP endpoints
authRouter.post('/farmer/send-otp', validateBody(sendOtpSchema), (req, res, next) =>
  authController.sendFarmerOtp(req, res, next),
);

authRouter.post('/farmer/verify-otp', validateBody(verifyOtpSchema), (req, res, next) =>
  authController.verifyFarmerOtp(req, res, next),
);

// Staff credentials endpoint
authRouter.post('/staff/login', validateBody(staffLoginSchema), (req, res, next) =>
  authController.staffLogin(req, res, next),
);

// Token management
authRouter.post('/refresh', validateBody(refreshTokenSchema), (req, res, next) =>
  authController.refreshToken(req, res, next),
);

authRouter.post('/logout', validateBody(logoutSchema), (req, res, next) =>
  authController.logout(req, res, next),
);

// Current user profile
authRouter.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next),
);

export { authRouter };
