import type { Request, Response, NextFunction } from 'express';
import type { Language } from '@prisma/client';
import { productService } from './product.service.js';

export class ProductController {
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const language = req.query['lang'] as Language | undefined;
      const includeInactive = req.query['includeInactive'] === 'true' && req.user?.type === 'STAFF';
      const products = await productService.listProducts(language, includeInactive);
      res.status(200).json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const language = req.query['lang'] as Language | undefined;
      const product = await productService.getProductById(id, language);
      res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.id;
      const created = await productService.createProduct(req.body, adminUserId);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const adminUserId = req.user!.id;
      const updated = await productService.updateProduct(id, req.body, adminUserId);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const { isActive } = req.body as { isActive: boolean };
      const adminUserId = req.user!.id;
      const updated = await productService.toggleActive(id, isActive, adminUserId);
      res.status(200).json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const productController = new ProductController();
