import { User } from '../models/User';
import { TouristProfile } from '../models/TouristProfile';
import { Alert } from '../models/Alert';
import { Anomaly } from '../models/Anomaly';
import { SosEvent } from '../models/SosEvent';
import { LocationPing } from '../models/LocationPing';
import { GeoFence } from '../models/GeoFence';
import { AnalyticsSnapshot, IAnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { alertService } from './alert.service';
import { anomalyService } from './anomaly.service';
import { ROLES, ALERT_STATUS, SOS_STATUS } from '../utils/constants';
import { getDayRange, getLastNDaysRange, getDayBucket, getHourBucket } from '../utils/time';
import { logger } from '../utils/logger';

class AnalyticsService {
  /**
   * Compute real-time analytics from live data.
   */
  async computeRealtime(): Promise<Record<string, any>> {
    const now = new Date();
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      totalTourists,
      activeTourists,
      activeAlerts,
      pendingAlerts,
      activeSOS,
      recentPings,
      alertMetrics,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.TOURIST }),
      TouristProfile.countDocuments({ isOnline: true }),
      Alert.countDocuments({ status: { $ne: ALERT_STATUS.RESOLVED } }),
      Alert.countDocuments({ status: ALERT_STATUS.PENDING }),
      SosEvent.countDocuments({ status: SOS_STATUS.ACTIVE }),
      LocationPing.countDocuments({ timestamp: { $gte: fiveMinAgo } }),
      alertService.getResponseMetrics(),
    ]);

    return {
      timestamp: now,
      tourists: {
        total: totalTourists,
        active: activeTourists,
        trackingRate: totalTourists > 0 ? ((activeTourists / totalTourists) * 100).toFixed(1) : 0,
      },
      alerts: {
        active: activeAlerts,
        pending: pendingAlerts,
        avgResponseTime: alertMetrics.avgResponseTime,
        avgResolutionTime: alertMetrics.avgResolutionTime,
        resolutionRate: alertMetrics.resolutionRate.toFixed(1),
      },
      sos: {
        active: activeSOS,
      },
      monitoring: {
        recentPingsLast5Min: recentPings,
        uptimePercent: 99.9, // placeholder
      },
    };
  }

  /**
   * Compute historical analytics for a date range.
   */
  async computeHistorical(
    startDate: Date,
    endDate: Date,
    period: 'hourly' | 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<IAnalyticsSnapshot[]> {
    return AnalyticsSnapshot.find({
      date: { $gte: startDate, $lte: endDate },
      period,
    })
      .sort({ date: 1 })
      .lean() as unknown as IAnalyticsSnapshot[];
  }

  /**
   * Get system overview.
   */
  async getOverview(): Promise<Record<string, any>> {
    const [
      totalUsers,
      totalTourists,
      totalResponders,
      totalAlerts,
      totalAnomalies,
      totalSOS,
      totalGeofences,
      totalPings,
      alertStatusCounts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.TOURIST }),
      User.countDocuments({ role: ROLES.RESPONDER }),
      Alert.countDocuments(),
      Anomaly.countDocuments(),
      SosEvent.countDocuments(),
      GeoFence.countDocuments({ isActive: true }),
      LocationPing.countDocuments(),
      alertService.getStatusCounts(),
    ]);

    return {
      users: { total: totalUsers, tourists: totalTourists, responders: totalResponders },
      alerts: { total: totalAlerts, byStatus: alertStatusCounts },
      anomalies: { total: totalAnomalies },
      sos: { total: totalSOS },
      geofences: { total: totalGeofences },
      locationPings: { total: totalPings },
    };
  }

  /**
   * Get zone analytics.
   */
  async getZoneAnalytics(): Promise<any[]> {
    const geofences = await GeoFence.find({ isActive: true }).lean();
    const results = [];

    for (const zone of geofences) {
      const [pingsInZone, breachAlerts] = await Promise.all([
        LocationPing.countDocuments({ zoneId: zone._id }),
        Alert.countDocuments({
          geofenceId: zone._id,
          type: 'geofence_breach',
        }),
      ]);

      results.push({
        zoneId: zone._id,
        name: zone.name,
        riskLevel: zone.riskLevel,
        currentOccupancy: zone.currentOccupancy,
        maxCapacity: zone.maxCapacity,
        pressure: zone.maxCapacity ? (zone.currentOccupancy / zone.maxCapacity) * 100 : 0,
        totalPings: pingsInZone,
        breachCount: breachAlerts,
        watchPriority: zone.watchPriority,
      });
    }

    return results.sort((a, b) => b.watchPriority - a.watchPriority);
  }

  /**
   * Get alert analytics.
   */
  async getAlertAnalytics(): Promise<Record<string, any>> {
    const { start: todayStart } = getDayRange(new Date());
    const { start: weekStart } = getLastNDaysRange(7);

    const [
      todayAlerts,
      weekAlerts,
      byType,
      bySeverity,
      responseMetrics,
    ] = await Promise.all([
      Alert.countDocuments({ timestamp: { $gte: todayStart } }),
      Alert.countDocuments({ timestamp: { $gte: weekStart } }),
      Alert.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Alert.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      alertService.getResponseMetrics(),
    ]);

    return {
      today: todayAlerts,
      thisWeek: weekAlerts,
      byType: Object.fromEntries(byType.map((t) => [t._id, t.count])),
      bySeverity: Object.fromEntries(bySeverity.map((s) => [s._id, s.count])),
      performance: responseMetrics,
    };
  }

  /**
   * Get behavior metrics.
   */
  async getBehaviorMetrics(): Promise<Record<string, any>> {
    const { start: weekStart } = getLastNDaysRange(7);

    const [avgSpeed, anomalySummary] = await Promise.all([
      LocationPing.aggregate([
        { $match: { timestamp: { $gte: weekStart }, speed: { $gt: 0 } } },
        { $group: { _id: null, avgSpeed: { $avg: '$speed' }, maxSpeed: { $max: '$speed' } } },
      ]),
      anomalyService.getSummary(weekStart),
    ]);

    return {
      movement: {
        avgSpeed: avgSpeed[0]?.avgSpeed?.toFixed(1) || 0,
        maxSpeed: avgSpeed[0]?.maxSpeed?.toFixed(1) || 0,
      },
      anomalies: anomalySummary,
    };
  }

  /**
   * Get performance metrics.
   */
  async getPerformanceMetrics(): Promise<Record<string, any>> {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const connectedClients = 0; // websocket count

    return {
      uptime: {
        seconds: Math.round(uptime),
        hours: (uptime / 3600).toFixed(2),
      },
      memory: {
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      },
      connectedClients,
    };
  }

  /**
   * Create a daily analytics snapshot.
   */
  async createDailySnapshot(date?: Date): Promise<IAnalyticsSnapshot> {
    const targetDate = date || new Date();
    const { start, end } = getDayRange(targetDate);

    const [
      totalTourists,
      activeTourists,
      newRegistrations,
      alerts,
      anomalySummary,
      sosCounts,
      pingCount,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.TOURIST }),
      TouristProfile.countDocuments({ isOnline: true }),
      User.countDocuments({ role: ROLES.TOURIST, createdAt: { $gte: start, $lte: end } }),
      Alert.find({ timestamp: { $gte: start, $lte: end } }).lean(),
      anomalyService.getSummary(start, end),
      SosEvent.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', SOS_STATUS.ACTIVE] }, 1, 0] } },
            falseAlarms: { $sum: { $cond: [{ $eq: ['$status', 'false_alarm'] }, 1, 0] } },
          },
        },
      ]),
      LocationPing.countDocuments({ timestamp: { $gte: start, $lte: end } }),
    ]);

    const resolvedAlerts = alerts.filter((a) => a.status === ALERT_STATUS.RESOLVED);
    const responseMetrics = await alertService.getResponseMetrics();

    const alertsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};
    for (const a of alerts) {
      alertsByType[a.type] = (alertsByType[a.type] || 0) + 1;
      alertsBySeverity[a.severity] = (alertsBySeverity[a.severity] || 0) + 1;
    }

    const snapshot = await AnalyticsSnapshot.create({
      date: start,
      period: 'daily',
      totalTourists,
      activeTourists,
      newRegistrations,
      totalAlerts: alerts.length,
      pendingAlerts: alerts.filter((a) => a.status === ALERT_STATUS.PENDING).length,
      resolvedAlerts: resolvedAlerts.length,
      alertsByType,
      alertsBySeverity,
      averageResponseTimeSeconds: responseMetrics.avgResponseTime,
      averageResolutionTimeSeconds: responseMetrics.avgResolutionTime,
      resolutionRate: responseMetrics.resolutionRate,
      totalAnomalies: anomalySummary.total,
      anomaliesByType: anomalySummary.byType,
      averageAnomalyScore: anomalySummary.avgScore,
      totalSosEvents: sosCounts[0]?.total || 0,
      activeSosEvents: sosCounts[0]?.active || 0,
      falseAlarmRate: sosCounts[0]?.total
        ? ((sosCounts[0]?.falseAlarms || 0) / sosCounts[0].total) * 100
        : 0,
      totalLocationPings: pingCount,
    });

    logger.info(`Daily analytics snapshot created for ${getDayBucket(targetDate)}`);
    return snapshot;
  }
}

export const analyticsService = new AnalyticsService();
