import { Router } from 'express';
import { getDashboard, getLiveTourists, getResponders, getAuditLog, exportData, assignResponder, recomputeAnalytics } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { validate, schemas } from '../middlewares/validate.middleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard', getDashboard);
router.get('/tourists/live', getLiveTourists);
router.get('/responders', getResponders);
router.get('/audit', getAuditLog);
router.get('/export', exportData);
router.post('/assign-responder', validate(schemas.assignResponder), assignResponder);
router.post('/recompute-analytics', recomputeAnalytics);

export default router;
