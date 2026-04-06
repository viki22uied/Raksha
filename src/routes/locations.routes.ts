import { Router } from 'express';
import { ping, batch, getLatest, getHistory } from '../controllers/locations.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/ping', validate(schemas.locationPing), ping);
router.post('/batch', validate(schemas.locationBatch), batch);
router.get('/latest/:touristId', validate(schemas.touristIdParam, 'params'), getLatest);
router.get('/history/:touristId', validate(schemas.touristIdParam, 'params'), getHistory);

export default router;
