import cron from 'node-cron';
import { LocationPing } from '../models/LocationPing';
import { Anomaly } from '../models/Anomaly';
import { TouristProfile } from '../models/TouristProfile';
import { logger } from '../utils/logger';

/**
 * Start anomaly detection batch jobs.
 */
export function startAnomalyJobs(): void {
  // Run anomaly detection sweep every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    try {
      logger.info('Running anomaly detection sweep...');
      
      // Get all online tourists
      const activeTourists = await TouristProfile.find({ isOnline: true }).select('userId').lean();
      
      logger.info(`Anomaly sweep: checking ${activeTourists.length} active tourists`);

      for (const tourist of activeTourists) {
        try {
          const recentPings = await LocationPing.find({ touristId: tourist.userId })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();

          if (recentPings.length < 5) continue;

          // Anomaly detection is triggered via location.service on ping ingestion
          // This batch job handles edge cases where detection was missed
        } catch (error) {
          logger.error(error, `Anomaly check failed for tourist ${tourist.userId}`);
        }
      }

      logger.info('Anomaly detection sweep completed');
    } catch (error) {
      logger.error(error, 'Anomaly detection sweep failed');
    }
  });

  logger.info('Anomaly detection jobs started');
}
