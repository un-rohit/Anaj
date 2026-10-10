import type { Request, Response, NextFunction } from 'express';
import type { SellRequestStatus } from '@prisma/client';
import { sellRequestService } from './sell-request.service.js';

export class SellRequestController {
  async createSellRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const created = await sellRequestService.createSellRequest(farmerId, req.body);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async getMySellRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
      const status = req.query['status'] as SellRequestStatus | undefined;

      const result = await sellRequestService.getMySellRequests(farmerId, page, limit, status);
      res.status(200).json({ success: true, data: result.items, meta: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getMySellRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const { id } = req.params as { id: string };
      const item = await sellRequestService.getMySellRequestById(farmerId, id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async listAllSellRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
      const farmerId = req.query['farmerId'] as string | undefined;
      const productId = req.query['productId'] as string | undefined;
      const status = req.query['status'] as SellRequestStatus | undefined;
      const startDate = req.query['startDate'] as string | undefined;
      const endDate = req.query['endDate'] as string | undefined;
      const search = req.query['search'] as string | undefined;

      const result = await sellRequestService.listAllSellRequests({
        page,
        limit,
        farmerId,
        productId,
        status,
        startDate,
        endDate,
        search,
      });

      res.status(200).json({ success: true, data: result.items, meta: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getSellRequestById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const item = await sellRequestService.getSellRequestById(id);
      res.status(200).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const staffUserId = req.user!.id;
      const updated = await sellRequestService.updateStatus(id, staffUserId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const sellRequestController = new SellRequestController();
