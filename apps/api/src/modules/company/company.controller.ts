import type { Request, Response, NextFunction } from 'express';
import { companyService } from './company.service.js';

export class CompanyController {
  async getPublicInfo(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const info = await companyService.getPublicInfo();
      res.status(200).json({ success: true, data: info });
    } catch (err) {
      next(err);
    }
  }

  async getAllSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await companyService.getAllSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  async updateSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { key, value, isPublic } = req.body as { key: string; value: string; isPublic?: boolean };
      const adminUserId = req.user!.id;
      const updated = await companyService.updateSetting(key, value, !!isPublic, adminUserId);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const companyController = new CompanyController();
