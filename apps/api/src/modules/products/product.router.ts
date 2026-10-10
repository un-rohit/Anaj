import { Router } from 'express';
import { z } from 'zod';
import { productController } from './product.controller.js';
import { authenticate, requireRole, optionalAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '@anaj/shared-validation';

const productRouter = Router();

const toggleActiveSchema = z.object({
  isActive: z.boolean(),
});

// Public / Farmer catalogue endpoints
productRouter.get('/', optionalAuth, (req, res, next) =>
  productController.listProducts(req, res, next),
);

productRouter.get('/:id', optionalAuth, (req, res, next) =>
  productController.getProductById(req, res, next),
);

// Admin / Owner catalogue management
productRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(createProductSchema),
  (req, res, next) => productController.createProduct(req, res, next),
);

productRouter.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(updateProductSchema),
  (req, res, next) => productController.updateProduct(req, res, next),
);

productRouter.patch(
  '/:id/toggle-active',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(toggleActiveSchema),
  (req, res, next) => productController.toggleActive(req, res, next),
);

export { productRouter };
