import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import { generalLimiter } from './middlewares/rateLimit.middleware';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './routes/auth.routes';
import touristRoutes from './routes/tourists.routes';
import locationRoutes from './routes/locations.routes';
import geofenceRoutes from './routes/geofence.routes';
import sosRoutes from './routes/sos.routes';
import alertRoutes from './routes/alerts.routes';
import analyticsRoutes from './routes/analytics.routes';
import identityRoutes from './routes/identity.routes';
import adminRoutes from './routes/admin.routes';
import healthRoutes from './routes/health.routes';

const app = express();

// ─── Global Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// ─── Request Logging ────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tourists', touristRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// --- Frontend Serving (Monolith mode) -------------------------------
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res, next) => {
  // If the request starts with /api/, it means a route was missed, so send 404
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Otherwise, let React Router handle the request
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ─── 404 Handler ────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
  });
});

// ─── Error Handler ──────────────────────────────────────────────────
app.use(errorMiddleware);

export default app;
