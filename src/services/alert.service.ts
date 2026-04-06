import { Types } from 'mongoose';
import { Alert, IAlert } from '../models/Alert';
import { User } from '../models/User';
import { websocketService } from './websocket.service';
import {
  ALERT_STATUS,
  ALERT_SEVERITY,
  AlertType,
  AlertSeverity,
  WS_EVENTS,
  ROLES,
} from '../utils/constants';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

export interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  cause: string;
  description?: string;
  touristId: string;
  location: { lat: number; lng: number };
  geofenceId?: string;
  anomalyId?: string;
  sosEventId?: string;
  metadata?: Record<string, any>;
}

class AlertService {
  /**
   * Create a new alert and broadcast it.
   */
  async create(input: CreateAlertInput): Promise<IAlert> {
    const alert = await Alert.create({
      type: input.type,
      severity: input.severity,
      cause: input.cause,
      description: input.description,
      touristId: new Types.ObjectId(input.touristId),
      location: input.location,
      geofenceId: input.geofenceId ? new Types.ObjectId(input.geofenceId) : undefined,
      anomalyId: input.anomalyId ? new Types.ObjectId(input.anomalyId) : undefined,
      sosEventId: input.sosEventId ? new Types.ObjectId(input.sosEventId) : undefined,
      status: ALERT_STATUS.PENDING,
      metadata: input.metadata,
      timestamp: new Date(),
    });

    // Auto-assign responder for critical alerts
    if (input.severity === ALERT_SEVERITY.CRITICAL) {
      await this.autoAssignResponder(alert);
    }

    // Broadcast to admins
    websocketService.emitToAdmin(WS_EVENTS.ALERT_CREATED, {
      alertId: alert._id,
      type: alert.type,
      severity: alert.severity,
      cause: alert.cause,
      touristId: alert.touristId,
      location: alert.location,
      status: alert.status,
      timestamp: alert.timestamp,
    });

    logger.info(`Alert created: ${alert.type} / ${alert.severity} — ${alert.cause}`);
    return alert;
  }

  /**
   * Get alerts with filters and pagination.
   */
  async getAll(
    filters: {
      status?: string;
      severity?: string;
      type?: string;
      touristId?: string;
      assignedTo?: string;
    } = {},
    page = 1,
    limit = 20
  ): Promise<{
    alerts: IAlert[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.severity) query.severity = filters.severity;
    if (filters.type) query.type = filters.type;
    if (filters.touristId) query.touristId = new Types.ObjectId(filters.touristId);
    if (filters.assignedTo) query.assignedTo = new Types.ObjectId(filters.assignedTo);

    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .populate('touristId', 'name email phone')
        .populate('assignedTo', 'name email phone')
        .populate('geofenceId', 'name riskLevel')
        .sort({ severity: 1, timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Alert.countDocuments(query),
    ]);

    return {
      alerts: alerts as unknown as IAlert[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get alert by ID.
   */
  async getById(alertId: string): Promise<IAlert> {
    const alert = await Alert.findById(alertId)
      .populate('touristId', 'name email phone')
      .populate('assignedTo', 'name email phone')
      .populate('geofenceId', 'name riskLevel polygon')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email');

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    return alert;
  }

  /**
   * Acknowledge an alert.
   */
  async acknowledge(alertId: string, userId: string): Promise<IAlert> {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new AppError('Alert not found', 404);

    if (alert.status !== ALERT_STATUS.PENDING) {
      throw new AppError(`Cannot acknowledge alert in ${alert.status} status`, 400);
    }

    const now = new Date();
    alert.status = ALERT_STATUS.ACKNOWLEDGED;
    alert.acknowledgedAt = now;
    alert.acknowledgedBy = new Types.ObjectId(userId);
    alert.responseTime = (now.getTime() - alert.timestamp.getTime()) / 1000;
    await alert.save();

    this.emitAlertUpdate(alert);
    logger.info(`Alert ${alertId} acknowledged by ${userId}`);
    return alert;
  }

  /**
   * Assign a responder to an alert.
   */
  async assign(alertId: string, responderId: string, eta?: number): Promise<IAlert> {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new AppError('Alert not found', 404);

    // Verify responder exists and has responder/admin role
    const responder = await User.findById(responderId);
    if (!responder || (responder.role !== ROLES.RESPONDER && responder.role !== ROLES.ADMIN)) {
      throw new AppError('Invalid responder', 400);
    }

    alert.status = ALERT_STATUS.ASSIGNED;
    alert.assignedTo = new Types.ObjectId(responderId);
    alert.assignedAt = new Date();
    alert.responderEta = eta;
    await alert.save();

    // Notify the responder
    websocketService.emitToResponder(responderId, WS_EVENTS.RESPONDER_ASSIGNED, {
      alertId: alert._id,
      type: alert.type,
      severity: alert.severity,
      location: alert.location,
      eta,
    });

    this.emitAlertUpdate(alert);
    logger.info(`Alert ${alertId} assigned to responder ${responderId}`);
    return alert;
  }

  /**
   * Escalate an alert.
   */
  async escalate(alertId: string, userId: string): Promise<IAlert> {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new AppError('Alert not found', 404);

    // Increase severity
    const severityOrder = [ALERT_SEVERITY.LOW, ALERT_SEVERITY.MEDIUM, ALERT_SEVERITY.HIGH, ALERT_SEVERITY.CRITICAL];
    const currentIdx = severityOrder.indexOf(alert.severity as any);
    if (currentIdx < severityOrder.length - 1) {
      alert.severity = severityOrder[currentIdx + 1] as any;
    }

    alert.status = ALERT_STATUS.ESCALATED;
    alert.escalatedAt = new Date();
    alert.escalatedBy = new Types.ObjectId(userId);
    await alert.save();

    this.emitAlertUpdate(alert);
    logger.warn(`Alert ${alertId} escalated to ${alert.severity}`);
    return alert;
  }

  /**
   * Resolve an alert.
   */
  async resolve(alertId: string, userId: string, notes?: string): Promise<IAlert> {
    const alert = await Alert.findById(alertId);
    if (!alert) throw new AppError('Alert not found', 404);

    const now = new Date();
    alert.status = ALERT_STATUS.RESOLVED;
    alert.resolvedAt = now;
    alert.resolvedBy = new Types.ObjectId(userId);
    alert.resolutionNotes = notes;
    alert.resolutionTime = (now.getTime() - alert.timestamp.getTime()) / 1000;
    await alert.save();

    this.emitAlertUpdate(alert);
    logger.info(`Alert ${alertId} resolved by ${userId}`);
    return alert;
  }

  /**
   * Auto-assign responder (nearest available or round-robin).
   */
  private async autoAssignResponder(alert: IAlert): Promise<void> {
    try {
      // Find available responders who don't have too many active alerts
      const responder = await User.findOne({
        role: ROLES.RESPONDER,
        isActive: true,
      }).lean();

      if (responder) {
        alert.assignedTo = responder._id as Types.ObjectId;
        alert.assignedAt = new Date();
        alert.status = ALERT_STATUS.ASSIGNED;
        await alert.save();

        websocketService.emitToResponder(responder._id.toString(), WS_EVENTS.RESPONDER_ASSIGNED, {
          alertId: alert._id,
          type: alert.type,
          severity: alert.severity,
          location: alert.location,
        });

        logger.info(`Auto-assigned responder ${responder._id} to alert ${alert._id}`);
      }
    } catch (error) {
      logger.error(error, 'Auto-assign responder failed');
    }
  }

  /**
   * Emit alert update via WebSocket.
   */
  private emitAlertUpdate(alert: IAlert): void {
    websocketService.emitToAdmin(WS_EVENTS.ALERT_UPDATED, {
      alertId: alert._id,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      assignedTo: alert.assignedTo,
      timestamp: new Date(),
    });
  }

  /**
   * Get alert counts by status.
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    const results = await Alert.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = {};
    for (const r of results) {
      counts[r._id] = r.count;
    }
    return counts;
  }

  /**
   * Get average response and resolution times.
   */
  async getResponseMetrics(): Promise<{
    avgResponseTime: number;
    avgResolutionTime: number;
    resolutionRate: number;
  }> {
    const [metrics] = await Alert.aggregate([
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' },
          avgResolutionTime: { $avg: '$resolutionTime' },
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', ALERT_STATUS.RESOLVED] }, 1, 0] },
          },
        },
      },
    ]);

    if (!metrics) {
      return { avgResponseTime: 0, avgResolutionTime: 0, resolutionRate: 0 };
    }

    return {
      avgResponseTime: Math.round(metrics.avgResponseTime || 0),
      avgResolutionTime: Math.round(metrics.avgResolutionTime || 0),
      resolutionRate: metrics.total > 0 ? (metrics.resolved / metrics.total) * 100 : 0,
    };
  }
}

export const alertService = new AlertService();
