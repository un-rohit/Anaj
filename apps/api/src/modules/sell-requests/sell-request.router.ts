import { Router } from 'express';
import { sellRequestController } from './sell-request.controller.js';
import { authenticate, requireFarmer, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { createSellRequestSchema, updateSellRequestStatusSchema } from '@anaj/shared-validation';

const sellRequestRouter = Router();

// Farmer-only routes
sellRequestRouter.post(
  '/',
  authenticate,
  requireFarmer,
  validateBody(createSellRequestSchema),
  (req, res, next) => sellRequestController.createSellRequest(req, res, next),
);

sellRequestRouter.get('/my', authenticate, requireFarmer, (req, res, next) =>
  sellRequestController.getMySellRequests(req, res, next),
);

sellRequestRouter.get('/my/:id', authenticate, requireFarmer, (req, res, next) =>
  sellRequestController.getMySellRequestById(req, res, next),
);

// Staff / Administrative routes
sellRequestRouter.get(
  '/',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER', 'COLLECTION_STAFF', 'QUALITY_INSPECTOR', 'ACCOUNTS_STAFF'),
  (req, res, next) => sellRequestController.listAllSellRequests(req, res, next),
);

sellRequestRouter.get(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER', 'COLLECTION_STAFF', 'QUALITY_INSPECTOR', 'ACCOUNTS_STAFF'),
  (req, res, next) => sellRequestController.getSellRequestById(req, res, next),
);

sellRequestRouter.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER'),
  validateBody(updateSellRequestStatusSchema),
  (req, res, next) => sellRequestController.updateStatus(req, res, next),
);

export { sellRequestRouter };
