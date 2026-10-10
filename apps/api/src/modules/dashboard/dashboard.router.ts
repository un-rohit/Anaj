import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const dashboardRouter = Router();

dashboardRouter.get(
  '/stats',
  authenticate,
  requireRole('OWNER', 'ADMIN', 'PROCUREMENT_MANAGER', 'ACCOUNTS_STAFF'),
  (req, res, next) => dashboardController.getStats(req, res, next),
);

export { dashboardRouter };
