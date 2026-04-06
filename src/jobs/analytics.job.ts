import cron from 'node-cron';
import { analyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';

/**
 * Start all scheduled analytics jobs.
 */
export function startScheduledJobs(): void {
  // Daily analytics snapshot at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running daily analytics snapshot job...');
      await analyticsService.createDailySnapshot();
      logger.info('Daily analytics snapshot completed');
    } catch (error) {
      logger.error(error, 'Daily analytics snapshot job failed');
    }
  });

  // Hourly realtime metrics refresh
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running hourly metrics computation...');
      const metrics = await analyticsService.computeRealtime();
      logger.debug(metrics, 'Hourly metrics computed');
    } catch (error) {
      logger.error(error, 'Hourly metrics computation failed');
    }
  });

  logger.info('Scheduled analytics jobs started');
}
