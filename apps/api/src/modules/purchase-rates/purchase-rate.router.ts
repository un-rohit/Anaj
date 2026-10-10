import { Router } from 'express';
import { purchaseRateController } from './purchase-rate.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createPurchaseRateSchema } from '@anaj/shared-validation';

const purchaseRateRouter = Router();

// Public / Mobile app: active rates for selling
purchaseRateRouter.get('/active', (req, res, next) =>
  purchaseRateController.getActiveRates(req, res, next),
);

// Admin: rate history for a product
purchaseRateRouter.get(
  '/history/:productId',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER'),
  (req, res, next) => purchaseRateController.getRateHistory(req, res, next),
);

// Admin: publish new rate
purchaseRateRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(createPurchaseRateSchema),
  (req, res, next) => purchaseRateController.createRate(req, res, next),
);

export { purchaseRateRouter };
