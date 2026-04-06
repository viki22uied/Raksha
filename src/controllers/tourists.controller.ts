import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { touristService } from '../services/tourist.service';
import { identityService } from '../services/identity.service';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadMiddleware = upload.single('document');

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as any) || 1;
  const limit = parseInt(req.query.limit as any) || 20;
  const result = await touristService.getAll(page, limit);
  res.json({ success: true, message: 'Tourists retrieved', data: result.tourists, meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const profile = await touristService.getById(req.params.id as any);
  res.json({ success: true, message: 'Tourist profile retrieved', data: profile });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const profile = await touristService.update(req.params.id as any, req.body);
  res.json({ success: true, message: 'Tourist profile updated', data: profile });
});

export const uploadDocs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const doc = await identityService.uploadDocument(req.params.id as any, req.body.documentType || 'other', req.file);
  res.status(201).json({ success: true, message: 'Document uploaded', data: doc });
});

export const getEmergencyPacket = asyncHandler(async (req: Request, res: Response) => {
  const packet = await identityService.getEmergencyPacket(req.params.id as any);
  res.json({ success: true, message: 'Emergency packet retrieved', data: packet });
});
