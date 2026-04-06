import { Router } from 'express';
import { getAll, getById, acknowledge, assign, escalate, resolve } from '../controllers/alerts.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { responderMiddleware } from '../middlewares/admin.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getAll);
router.get('/:id', validate(schemas.objectId, 'params'), getById);
router.post('/:id/acknowledge', responderMiddleware, validate(schemas.objectId, 'params'), acknowledge);
router.post('/:id/assign', responderMiddleware, validate(schemas.objectId, 'params'), validate(schemas.assignAlert), assign);
router.post('/:id/escalate', responderMiddleware, validate(schemas.objectId, 'params'), escalate);
router.post('/:id/resolve', responderMiddleware, validate(schemas.objectId, 'params'), resolve);

export default router;
