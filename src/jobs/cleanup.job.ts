import cron from 'node-cron';
import { LocationPing } from '../models/LocationPing';
import { AdminAction } from '../models/AdminAction';
import { TouristProfile } from '../models/TouristProfile';
import { logger } from '../utils/logger';

/**
 * Start cleanup jobs.
 */
export function startCleanupJobs(): void {
  // Mark tourists as offline if no ping in last 10 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
      const result = await TouristProfile.updateMany(
        { isOnline: true, 'lastKnownLocation.timestamp': { $lt: tenMinAgo } },
        { $set: { isOnline: false } }
      );
      if (result.modifiedCount > 0) {
        logger.info(`Marked ${result.modifiedCount} tourists as offline`);
      }
    } catch (error) {
      logger.error(error, 'Tourist offline cleanup failed');
    }
  });

  // Clean old audit logs (older than 1 year) — monthly
  cron.schedule('0 2 1 * *', async () => {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const result = await AdminAction.deleteMany({ timestamp: { $lt: oneYearAgo } });
      logger.info(`Cleaned ${result.deletedCount} old audit log entries`);
    } catch (error) {
      logger.error(error, 'Audit log cleanup failed');
    }
  });

  logger.info('Cleanup jobs started');
}
