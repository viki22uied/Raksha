import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { identityService } from '../services/identity.service';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const identityUploadMiddleware = upload.single('document');

export const create = asyncHandler(async (req: Request, res: Response) => {
  const result = await identityService.createIdentity(req.body.touristId, req.body.documentType);
  res.status(201).json({ success: true, message: 'Identity DID created', data: result });
});

export const uploadDoc = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded' });
    return;
  }
  const touristId = req.user!.userId;
  const doc = await identityService.uploadDocument(touristId, req.body.documentType || 'other', req.file);
  res.status(201).json({ success: true, message: 'Identity document uploaded and stored', data: doc });
});

export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
  const docs = await identityService.getDocuments(req.params.id as any);
  res.json({ success: true, message: 'Identity documents retrieved', data: docs });
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  const { approved, rejectionReason } = req.body;
  const doc = await identityService.verifyDocument(req.params.id as any, req.user!.userId, approved !== false, rejectionReason);
  res.json({ success: true, message: `Identity ${doc.verificationStatus}`, data: doc });
});

export const getEmergencyPacket = asyncHandler(async (req: Request, res: Response) => {
  const packet = await identityService.getEmergencyPacket(req.params.id as any);
  res.json({ success: true, message: 'Emergency identity packet retrieved', data: packet });
});
