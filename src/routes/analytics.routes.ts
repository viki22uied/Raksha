import { Router } from 'express';
import { getRealtime, getHistorical, getOverview, getZones, getAlerts, getBehavior, getPerformance } from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { responderMiddleware } from '../middlewares/admin.middleware';

const router = Router();

router.use(authMiddleware);
router.use(responderMiddleware);

router.get('/realtime', getRealtime);
router.get('/historical', getHistorical);
router.get('/overview', getOverview);
router.get('/zones', getZones);
router.get('/alerts', getAlerts);
router.get('/behavior', getBehavior);
router.get('/performance', getPerformance);

export default router;
