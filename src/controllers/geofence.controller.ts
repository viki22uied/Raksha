import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { geofenceService } from '../services/geofence.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const geofence = await geofenceService.create(req.body, req.user!.userId);
  res.status(201).json({ success: true, message: 'Geofence created', data: geofence });
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const activeOnly = (req.query.active as any) === 'true';
  const geofences = await geofenceService.getAll(activeOnly);
  res.json({ success: true, message: 'Geofences retrieved', data: geofences });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const geofence = await geofenceService.getById(req.params.id as any);
  res.json({ success: true, message: 'Geofence retrieved', data: geofence });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const geofence = await geofenceService.update(req.params.id as any, req.body);
  res.json({ success: true, message: 'Geofence updated', data: geofence });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await geofenceService.delete(req.params.id as any);
  res.json({ success: true, message: 'Geofence deactivated', data: null });
});

export const check = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.body;
  const results = await geofenceService.checkAllZones(lat, lng);
  res.json({ success: true, message: 'Geofence check complete', data: results });
});
