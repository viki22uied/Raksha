import { Router } from 'express';
import { create, getAll, getById, update, remove, check } from '../controllers/geofence.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', adminMiddleware, validate(schemas.createGeoFence), create);
router.get('/', getAll);
router.get('/:id', validate(schemas.objectId, 'params'), getById);
router.put('/:id', adminMiddleware, validate(schemas.objectId, 'params'), validate(schemas.updateGeoFence), update);
router.delete('/:id', adminMiddleware, validate(schemas.objectId, 'params'), remove);
router.post('/check', validate(schemas.checkGeoFence), check);

export default router;
