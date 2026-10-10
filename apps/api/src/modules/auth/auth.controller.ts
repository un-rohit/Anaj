import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

export class AuthController {
  async sendFarmerOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body as { phone: string };
      const result = await authService.sendFarmerOtp(phone);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async verifyFarmerOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, otp } = req.body as { phone: string; otp: string };
      const result = await authService.verifyFarmerOtp(phone, otp);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async staffLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body as { identifier: string; password: string };
      const result = await authService.staffLogin(identifier, password);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await authService.refreshAccessToken(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        return;
      }
      const result = await authService.getMe(req.user);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
