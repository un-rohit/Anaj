import type { Request, Response, NextFunction } from 'express';
import { farmerService } from './farmer.service.js';

export class FarmerController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const profile = await farmerService.getProfile(farmerId);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const farmerId = req.user!.id;
      const updated = await farmerService.updateProfile(farmerId, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async listFarmers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
      const search = req.query['search'] as string | undefined;
      const isVerified = req.query['isVerified'] !== undefined ? req.query['isVerified'] === 'true' : undefined;
      const isActive = req.query['isActive'] !== undefined ? req.query['isActive'] === 'true' : undefined;
      const district = req.query['district'] as string | undefined;

      const result = await farmerService.listFarmers({ page, limit, search, isVerified, isActive, district });
      res.status(200).json({ success: true, data: result.items, meta: result.pagination });
    } catch (err) {
      next(err);
    }
  }

  async getFarmerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const farmer = await farmerService.getFarmerById(id);
      res.status(200).json({ success: true, data: farmer });
    } catch (err) {
      next(err);
    }
  }

  async verifyFarmer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { isVerified } = req.body as { isVerified: boolean };
      const updated = await farmerService.verifyFarmer(id, isVerified, req.user!.id);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async updateFarmerStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { isActive } = req.body as { isActive: boolean };
      const updated = await farmerService.updateFarmerStatus(id, isActive, req.user!.id);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async addFarmerNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { note } = req.body as { note: string };
      const created = await farmerService.addFarmerNote(id, req.user!.id, note);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
}

export const farmerController = new FarmerController();
