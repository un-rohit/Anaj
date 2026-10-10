import { Router } from 'express';
import { auditLogController } from './audit-log.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const auditLogRouter = Router();

// Only Owner and Admin can inspect audit logs
auditLogRouter.get(
  '/',
  authenticate,
  requireRole('OWNER', 'ADMIN'),
  (req, res, next) => auditLogController.listAuditLogs(req, res, next),
);

export { auditLogRouter };
