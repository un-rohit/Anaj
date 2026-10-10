import { Router } from 'express';
import { z } from 'zod';
import { farmerController } from './farmer.controller.js';
import { authenticate, requireFarmer, requireRole } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { updateFarmerProfileSchema } from '@anaj/shared-validation';

const farmerRouter = Router();

const verifySchema = z.object({
  isVerified: z.boolean(),
});

const statusSchema = z.object({
  isActive: z.boolean(),
});

const noteSchema = z.object({
  note: z.string().trim().min(1, 'Note content is required').max(2000),
});

// Farmer self-service routes
farmerRouter.get('/me', authenticate, requireFarmer, (req, res, next) =>
  farmerController.getProfile(req, res, next),
);

farmerRouter.patch('/me', authenticate, requireFarmer, validateBody(updateFarmerProfileSchema), (req, res, next) =>
  farmerController.updateProfile(req, res, next),
);

// Admin / Staff management routes
farmerRouter.get(
  '/',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER'),
  (req, res, next) => farmerController.listFarmers(req, res, next),
);

farmerRouter.get(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER'),
  (req, res, next) => farmerController.getFarmerById(req, res, next),
);

farmerRouter.patch(
  '/:id/verify',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(verifySchema),
  (req, res, next) => farmerController.verifyFarmer(req, res, next),
);

farmerRouter.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN', 'OWNER'),
  validateBody(statusSchema),
  (req, res, next) => farmerController.updateFarmerStatus(req, res, next),
);

farmerRouter.post(
  '/:id/notes',
  authenticate,
  requireRole('ADMIN', 'OWNER', 'PROCUREMENT_MANAGER'),
  validateBody(noteSchema),
  (req, res, next) => farmerController.addFarmerNote(req, res, next),
);

export { farmerRouter };
