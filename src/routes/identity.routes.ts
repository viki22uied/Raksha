import { Router } from 'express';
import { create, uploadDoc, getDocuments, verify, getEmergencyPacket, identityUploadMiddleware } from '../controllers/identity.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';
import { uploadLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/create', validate(schemas.createIdentity), create);
router.post('/upload', uploadLimiter, identityUploadMiddleware, uploadDoc);
router.get('/:touristId', validate(schemas.touristIdParam, 'params'), getDocuments);
router.post('/:touristId/verify', adminMiddleware, validate(schemas.touristIdParam, 'params'), verify);
router.get('/:touristId/emergency-packet', validate(schemas.touristIdParam, 'params'), getEmergencyPacket);

export default router;
