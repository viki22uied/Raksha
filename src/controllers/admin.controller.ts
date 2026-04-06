import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { adminService } from '../services/admin.service';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getDashboard();
  res.json({ success: true, message: 'Admin dashboard', data });
});

export const getLiveTourists = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getLiveTourists();
  res.json({ success: true, message: 'Live tourists', data });
});

export const getResponders = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getResponders();
  res.json({ success: true, message: 'Responders list', data });
});

export const getAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const data = await adminService.getAuditLog(page, limit);
  res.json({ success: true, message: 'Audit log', data: data.actions, meta: { total: data.total, page: data.page, totalPages: data.totalPages } });
});

export const exportData = asyncHandler(async (req: Request, res: Response) => {
  const type = (req.query.type as string) || 'tourists';
  const format = (req.query.format as string) || 'json';
  const data = await adminService.exportData(type);
  if (format === 'csv') {
    if (data.length === 0) { res.status(200).send(''); return; }
    const headers = Object.keys(data[0] as any).join(',');
    const rows = data.map((r: any) => Object.values(r).map((v) => JSON.stringify(v ?? '')).join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_export.csv`);
    res.send([headers, ...rows].join('\n'));
    return;
  }
  res.json({ success: true, message: `${type} data exported`, data });
});

export const assignResponder = asyncHandler(async (req: Request, res: Response) => {
  const { alertId, responderId, eta } = req.body;
  const alert = await adminService.assignResponder(alertId, responderId, req.user!.userId, eta);
  res.json({ success: true, message: 'Responder assigned', data: alert });
});

export const recomputeAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const snapshot = await adminService.recomputeAnalytics(req.user!.userId);
  res.json({ success: true, message: 'Analytics recomputed', data: snapshot });
});
