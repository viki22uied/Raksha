import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { alertService } from '../services/alert.service';

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { status, severity, type, touristId, assignedTo, page, limit } = req.query;
  const result = await alertService.getAll(
    { status: status as any, severity: severity as any, type: type as any, touristId: touristId as any, assignedTo: assignedTo as any },
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20
  );
  res.json({ success: true, message: 'Alerts retrieved', data: result.alerts, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const alert = await alertService.getById(req.params.id as any);
  res.json({ success: true, message: 'Alert retrieved', data: alert });
});

export const acknowledge = asyncHandler(async (req: Request, res: Response) => {
  const alert = await alertService.acknowledge(req.params.id as any, req.user!.userId);
  res.json({ success: true, message: 'Alert acknowledged', data: alert });
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const alert = await alertService.assign(req.params.id as any, req.body.responderId, req.body.eta);
  res.json({ success: true, message: 'Responder assigned', data: alert });
});

export const escalate = asyncHandler(async (req: Request, res: Response) => {
  const alert = await alertService.escalate(req.params.id as any, req.user!.userId);
  res.json({ success: true, message: 'Alert escalated', data: alert });
});

export const resolve = asyncHandler(async (req: Request, res: Response) => {
  const alert = await alertService.resolve(req.params.id as any, req.user!.userId, req.body.notes);
  res.json({ success: true, message: 'Alert resolved', data: alert });
});
