import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { analyticsService } from '../services/analytics.service';

export const getRealtime = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.computeRealtime();
  res.json({ success: true, message: 'Realtime analytics', data });
});

export const getHistorical = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, period } = req.query;
  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate as string) : new Date();
  const data = await analyticsService.computeHistorical(start, end, (period as any) || 'daily');
  res.json({ success: true, message: 'Historical analytics', data });
});

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getOverview();
  res.json({ success: true, message: 'System overview', data });
});

export const getZones = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getZoneAnalytics();
  res.json({ success: true, message: 'Zone analytics', data });
});

export const getAlerts = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getAlertAnalytics();
  res.json({ success: true, message: 'Alert analytics', data });
});

export const getBehavior = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getBehaviorMetrics();
  res.json({ success: true, message: 'Behavior metrics', data });
});

export const getPerformance = asyncHandler(async (_req: Request, res: Response) => {
  const data = await analyticsService.getPerformanceMetrics();
  res.json({ success: true, message: 'Performance metrics', data });
});
