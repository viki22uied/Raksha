import { Router } from 'express';
import { trigger, getEvents } from '../controllers/sos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';
import { sosLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/trigger', sosLimiter, validate(schemas.triggerSos), trigger);
router.get('/events', getEvents);

export default router;
