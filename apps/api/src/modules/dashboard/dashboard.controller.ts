import type { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service.js';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query['startDate'] as string | undefined;
      const endDate = req.query['endDate'] as string | undefined;

      const stats = await dashboardService.getStats({ startDate, endDate });
      res.status(200).json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
