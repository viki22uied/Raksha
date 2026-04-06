import { Router } from 'express';
import { getAll, getById, update, uploadDocs, getEmergencyPacket, uploadMiddleware } from '../controllers/tourists.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';
import { uploadLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.get('/:id', validate(schemas.objectId, 'params'), getById);
router.put('/:id', validate(schemas.objectId, 'params'), validate(schemas.updateProfile), update);
router.post('/:id/docs', uploadLimiter, validate(schemas.objectId, 'params'), uploadMiddleware, uploadDocs);
router.get('/:id/emergency-packet', validate(schemas.objectId, 'params'), getEmergencyPacket);

export default router;
