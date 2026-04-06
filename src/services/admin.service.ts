import { Types } from 'mongoose';
import { User } from '../models/User';
import { AdminAction } from '../models/AdminAction';
import { Alert } from '../models/Alert';
import { TouristProfile } from '../models/TouristProfile';
import { AnalyticsSnapshot } from '../models/AnalyticsSnapshot';
import { Anomaly } from '../models/Anomaly';
import { SosEvent } from '../models/SosEvent';
import { GeoFence } from '../models/GeoFence';
import { analyticsService } from './analytics.service';
import { alertService } from './alert.service';
import { websocketService } from './websocket.service';
import { ROLES, WS_EVENTS, AdminActionType, ALERT_STATUS, SOS_STATUS } from '../utils/constants';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

class AdminService {
  async getDashboard(): Promise<Record<string, any>> {
    const [overview, realtime, zoneAnalytics] = await Promise.all([
      analyticsService.getOverview(),
      analyticsService.computeRealtime(),
      analyticsService.getZoneAnalytics(),
    ]);
    return { overview, realtime, zones: zoneAnalytics, generatedAt: new Date() };
  }

  async getLiveTourists(): Promise<any[]> {
    const tourists = await TouristProfile.find({ isOnline: true })
      .populate('userId', 'name email phone')
      .lean();
    return tourists.map((t) => ({
      id: t.userId,
      profile: { nationality: t.nationality, bloodGroup: t.bloodGroup },
      location: t.lastKnownLocation,
      isOnline: t.isOnline,
      deviceInfo: t.deviceInfo,
    }));
  }

  async getResponders(): Promise<any[]> {
    const responders = await User.find({ role: ROLES.RESPONDER, isActive: true }).lean();
    const results = [];
    for (const r of responders) {
      const activeAlerts = await Alert.countDocuments({
        assignedTo: r._id,
        status: { $in: [ALERT_STATUS.ASSIGNED, ALERT_STATUS.ACKNOWLEDGED] },
      });
      results.push({ id: r._id, name: r.name, email: r.email, phone: r.phone, activeAlerts });
    }
    return results;
  }

  async logAction(adminId: string, actionType: AdminActionType, description: string, targetId?: string, targetModel?: string, metadata?: Record<string, any>, req?: any): Promise<void> {
    await AdminAction.create({
      adminId: new Types.ObjectId(adminId),
      actionType,
      targetId: targetId ? new Types.ObjectId(targetId) : undefined,
      targetModel,
      description,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
      timestamp: new Date(),
    });
  }

  async getAuditLog(page = 1, limit = 50): Promise<{ actions: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [actions, total] = await Promise.all([
      AdminAction.find().populate('adminId', 'name email').sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AdminAction.countDocuments(),
    ]);
    return { actions, total, page, totalPages: Math.ceil(total / limit) };
  }

  async exportData(type: string): Promise<any[]> {
    switch (type) {
      case 'tourists':
        return TouristProfile.find().populate('userId', 'name email phone').lean();
      case 'alerts':
        return Alert.find().populate('touristId', 'name email').sort({ timestamp: -1 }).limit(1000).lean();
      case 'anomalies':
        return Anomaly.find().sort({ timestamp: -1 }).limit(1000).lean();
      case 'sos':
        return SosEvent.find().populate('touristId', 'name email').sort({ timestamp: -1 }).limit(1000).lean();
      case 'analytics':
        return AnalyticsSnapshot.find().sort({ date: -1 }).limit(365).lean();
      case 'geofences':
        return GeoFence.find().lean();
      default:
        throw new AppError(`Unknown export type: ${type}`, 400);
    }
  }

  async assignResponder(alertId: string, responderId: string, adminId: string, eta?: number): Promise<any> {
    const alert = await alertService.assign(alertId, responderId, eta);
    await this.logAction(adminId, 'responder_assign' as AdminActionType, `Assigned responder ${responderId} to alert ${alertId}`, alertId, 'Alert', { responderId, eta });
    return alert;
  }

  async recomputeAnalytics(adminId: string): Promise<any> {
    const snapshot = await analyticsService.createDailySnapshot();
    await this.logAction(adminId, 'analytics_recompute' as AdminActionType, 'Recomputed daily analytics snapshot');
    websocketService.emitToAdmin(WS_EVENTS.ANALYTICS_UPDATED, { snapshot, timestamp: new Date() });
    return snapshot;
  }
}

export const adminService = new AdminService();
