import type { Request, Response, NextFunction } from 'express';
import { purchaseRateService } from './purchase-rate.service.js';

export class PurchaseRateController {
  async getActiveRates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rates = await purchaseRateService.getActiveRates();
      res.status(200).json({ success: true, data: rates });
    } catch (err) {
      next(err);
    }
  }

  async getRateHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params as { productId: string };
      const history = await purchaseRateService.getRateHistory(productId);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  async createRate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.id;
      const rate = await purchaseRateService.createRate(req.body, adminUserId);
      res.status(201).json({ success: true, data: rate });
    } catch (err) {
      next(err);
    }
  }
}

export const purchaseRateController = new PurchaseRateController();
