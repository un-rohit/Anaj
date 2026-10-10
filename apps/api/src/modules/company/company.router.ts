import { Router } from 'express';
import { z } from 'zod';
import { companyController } from './company.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';

const companyRouter = Router();

const updateSettingSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().trim(),
  isPublic: z.boolean().default(false),
});

// Public contact and support information
companyRouter.get('/public', (req, res, next) =>
  companyController.getPublicInfo(req, res, next),
);

// Admin-only company settings management
companyRouter.get(
  '/settings',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  (req, res, next) => companyController.getAllSettings(req, res, next),
);

companyRouter.patch(
  '/settings',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(updateSettingSchema),
  (req, res, next) => companyController.updateSetting(req, res, next),
);

export { companyRouter };
