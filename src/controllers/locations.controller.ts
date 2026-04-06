import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { locationService } from '../services/location.service';

export const ping = asyncHandler(async (req: Request, res: Response) => {
  const touristId = req.user!.userId;
  const result = await locationService.ingestPing(touristId, req.body);
  res.status(201).json({ success: true, message: 'Location ping recorded', data: { pingId: result._id, timestamp: result.timestamp } });
});

export const batch = asyncHandler(async (req: Request, res: Response) => {
  const touristId = req.user!.userId;
  const result = await locationService.ingestBatch(touristId, req.body.pings);
  res.status(201).json({ success: true, message: 'Batch pings recorded', data: result });
});

export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const ping = await locationService.getLatest(req.params.id as any);
  res.json({ success: true, message: ping ? 'Latest location retrieved' : 'No location data found', data: ping });
});

export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, page, limit } = req.query;
  const result = await locationService.getHistory(
    req.params.id as any,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined,
    parseInt(page as string) || 1,
    parseInt(limit as string) || 50
  );
  res.json({ success: true, message: 'Location history retrieved', data: result.pings, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});
