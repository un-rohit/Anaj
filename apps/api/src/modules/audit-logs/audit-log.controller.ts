import type { Request, Response, NextFunction } from 'express';
import { auditLogService } from './audit-log.service.js';

export class AuditLogController {
  async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : 1;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 25;
      const entityType = req.query['entityType'] as string | undefined;
      const entityId = req.query['entityId'] as string | undefined;
      const actorId = req.query['actorId'] as string | undefined;
      const action = req.query['action'] as string | undefined;

      const result = await auditLogService.listAuditLogs({
        page,
        limit,
        entityType,
        entityId,
        actorId,
        action,
      });

      res.status(200).json({ success: true, data: result.items, meta: result.pagination });
    } catch (err) {
      next(err);
    }
  }
}

export const auditLogController = new AuditLogController();
