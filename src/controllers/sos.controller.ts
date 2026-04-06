import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sosService } from '../services/sos.service';

export const trigger = asyncHandler(async (req: Request, res: Response) => {
  const touristId = req.user!.userId;
  const sosEvent = await sosService.trigger(touristId, req.body);
  res.status(201).json({ success: true, message: 'SOS triggered successfully', data: sosEvent });
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const { status, touristId, startDate, endDate, page, limit } = req.query;
  const result = await sosService.getEvents(
    {
      status: status as string,
      touristId: touristId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    },
    parseInt(page as string) || 1,
    parseInt(limit as string) || 20
  );
  res.json({ success: true, message: 'SOS events retrieved', data: result.events, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});
