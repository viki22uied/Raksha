import { Types } from 'mongoose';
import { SosEvent, ISosEvent } from '../models/SosEvent';
import { alertService } from './alert.service';
import { websocketService } from './websocket.service';
import { ALERT_TYPE, ALERT_SEVERITY, SOS_STATUS, WS_EVENTS } from '../utils/constants';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

export interface SosTriggerInput {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
  message?: string;
  battery?: number;
}

class SosService {
  /**
   * Trigger an SOS event.
   */
  async trigger(touristId: string, input: SosTriggerInput): Promise<ISosEvent> {
    // Check if there's already an active SOS for this tourist
    const activeSos = await SosEvent.findOne({
      touristId: new Types.ObjectId(touristId),
      status: SOS_STATUS.ACTIVE,
    });

    if (activeSos) {
      // Update existing SOS with new location
      activeSos.location = {
        lat: input.lat,
        lng: input.lng,
        altitude: input.altitude,
        accuracy: input.accuracy,
      };
      activeSos.battery = input.battery;
      await activeSos.save();
      return activeSos;
    }

    // Create new SOS event
    const sosEvent = await SosEvent.create({
      touristId: new Types.ObjectId(touristId),
      location: {
        lat: input.lat,
        lng: input.lng,
        altitude: input.altitude,
        accuracy: input.accuracy,
      },
      message: input.message,
      battery: input.battery,
      status: SOS_STATUS.ACTIVE,
      timestamp: new Date(),
    });

    // Create high-priority alert
    const alert = await alertService.create({
      type: ALERT_TYPE.SOS,
      severity: ALERT_SEVERITY.CRITICAL,
      cause: 'SOS activated by tourist',
      description: input.message || 'Emergency SOS triggered',
      touristId,
      location: { lat: input.lat, lng: input.lng },
      sosEventId: sosEvent._id.toString(),
    });

    // Link alert to SOS event
    sosEvent.linkedAlertId = alert._id as Types.ObjectId;
    await sosEvent.save();

    // Emit WebSocket SOS event
    websocketService.emitToAdmin(WS_EVENTS.TOURIST_SOS_TRIGGERED, {
      sosEventId: sosEvent._id,
      touristId,
      location: sosEvent.location,
      message: input.message,
      battery: input.battery,
      alertId: alert._id,
      timestamp: sosEvent.timestamp,
    });

    logger.warn(`SOS triggered by tourist ${touristId} at ${input.lat}, ${input.lng}`);
    return sosEvent;
  }

  /**
   * Get SOS events with filters.
   */
  async getEvents(
    filters: {
      status?: string;
      touristId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
    page = 1,
    limit = 20
  ): Promise<{
    events: ISosEvent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.touristId) query.touristId = new Types.ObjectId(filters.touristId);
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      SosEvent.find(query)
        .populate('touristId', 'name email phone')
        .populate('resolvedBy', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SosEvent.countDocuments(query),
    ]);

    return {
      events: events as unknown as ISosEvent[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Resolve an SOS event.
   */
  async resolve(
    sosEventId: string,
    resolvedBy: string,
    notes?: string
  ): Promise<ISosEvent> {
    const sosEvent = await SosEvent.findByIdAndUpdate(
      sosEventId,
      {
        status: SOS_STATUS.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy: new Types.ObjectId(resolvedBy),
        resolutionNotes: notes,
      },
      { new: true }
    );

    if (!sosEvent) {
      throw new AppError('SOS event not found', 404);
    }

    logger.info(`SOS event resolved: ${sosEventId}`);
    return sosEvent;
  }
}

export const sosService = new SosService();
