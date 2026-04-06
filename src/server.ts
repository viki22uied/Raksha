import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initWebSocket } from './config/websocket';
import { logger } from './utils/logger';
import { startScheduledJobs } from './jobs/analytics.job';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize WebSocket
    initWebSocket(httpServer);

    // Start scheduled jobs
    startScheduledJobs();

    // Start listening
    httpServer.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║        RakshaSetu API Server Started         ║
╠══════════════════════════════════════════════╣
║  Environment : ${env.NODE_ENV.padEnd(29)}║
║  Port        : ${String(env.PORT).padEnd(29)}║
║  API URL     : http://localhost:${String(env.PORT).padEnd(14)}║
║  WebSocket   : Enabled                      ║
╚══════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
