import { Types } from 'mongoose';
import { LocationPing, ILocationPing } from '../models/LocationPing';
import { touristService } from './tourist.service';
import { geofenceService } from './geofence.service';
import { anomalyService } from './anomaly.service';
import { websocketService } from './websocket.service';
import { ANOMALY_THRESHOLDS, WS_EVENTS } from '../utils/constants';
import { logger } from '../utils/logger';

export interface PingInput {
  lat: number;
  lng: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  battery?: number;
  accelerometer?: { x: number; y: number; z: number };
  timestamp?: Date;
}

class LocationService {
  /**
   * Ingest a single location ping.
   */
  async ingestPing(touristId: string, pingData: PingInput): Promise<ILocationPing> {
    // Check geofence status
    const zoneInfo = await geofenceService.checkPoint(pingData.lat, pingData.lng);

    const ping = await LocationPing.create({
      touristId: new Types.ObjectId(touristId),
      lat: pingData.lat,
      lng: pingData.lng,
      altitude: pingData.altitude,
      speed: pingData.speed,
      heading: pingData.heading,
      accuracy: pingData.accuracy,
      battery: pingData.battery,
      accelerometer: pingData.accelerometer,
      zoneId: zoneInfo?.zoneId,
      zoneName: zoneInfo?.zoneName,
      isInsideSafeZone: zoneInfo?.isInside ?? false,
      timestamp: pingData.timestamp || new Date(),
    });

    // Update tourist's last known location
    await touristService.updateLocation(touristId, pingData.lat, pingData.lng);

    // Emit WebSocket event
    websocketService.emitToAdmin(WS_EVENTS.TOURIST_LOCATION_UPDATE, {
      touristId,
      lat: pingData.lat,
      lng: pingData.lng,
      speed: pingData.speed,
      battery: pingData.battery,
      zone: zoneInfo?.zoneName,
      timestamp: ping.timestamp,
    });

    // Check for geofence breach
    if (zoneInfo && !zoneInfo.isInside) {
      await geofenceService.handleBreach(touristId, pingData.lat, pingData.lng, zoneInfo);
    }

    // Run anomaly detection on recent sequence
    this.runAnomalyDetection(touristId).catch((err) =>
      logger.error('Background anomaly detection failed', err)
    );

    return ping;
  }

  /**
   * Ingest a batch of location pings.
   */
  async ingestBatch(touristId: string, pings: PingInput[]): Promise<{ ingested: number }> {
    const results = [];

    for (const pingData of pings) {
      const zoneInfo = await geofenceService.checkPoint(pingData.lat, pingData.lng);

      results.push({
        touristId: new Types.ObjectId(touristId),
        lat: pingData.lat,
        lng: pingData.lng,
        altitude: pingData.altitude,
        speed: pingData.speed,
        heading: pingData.heading,
        accuracy: pingData.accuracy,
        battery: pingData.battery,
        accelerometer: pingData.accelerometer,
        zoneId: zoneInfo?.zoneId,
        zoneName: zoneInfo?.zoneName,
        isInsideSafeZone: zoneInfo?.isInside ?? false,
        timestamp: pingData.timestamp || new Date(),
      });
    }

    await LocationPing.insertMany(results);

    // Update tourist location with most recent ping
    const lastPing = pings[pings.length - 1];
    await touristService.updateLocation(touristId, lastPing.lat, lastPing.lng);

    // Run anomaly detection
    this.runAnomalyDetection(touristId).catch((err) =>
      logger.error('Background anomaly detection failed', err)
    );

    logger.info(`Batch ingested ${results.length} pings for tourist ${touristId}`);
    return { ingested: results.length };
  }

  /**
   * Get latest ping for a tourist.
   */
  async getLatest(touristId: string): Promise<ILocationPing | null> {
    return LocationPing.findOne({ touristId: new Types.ObjectId(touristId) })
      .sort({ timestamp: -1 })
      .lean() as unknown as ILocationPing | null;
  }

  /**
   * Get location history for a tourist.
   */
  async getHistory(
    touristId: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 50
  ): Promise<{
    pings: ILocationPing[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = { touristId: new Types.ObjectId(touristId) };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const skip = (page - 1) * limit;
    const [pings, total] = await Promise.all([
      LocationPing.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LocationPing.countDocuments(query),
    ]);

    return {
      pings: pings as unknown as ILocationPing[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get recent pings for anomaly detection.
   */
  async getRecentSequence(
    touristId: string,
    count: number = ANOMALY_THRESHOLDS.SEQUENCE_LENGTH
  ): Promise<ILocationPing[]> {
    return LocationPing.find({ touristId: new Types.ObjectId(touristId) })
      .sort({ timestamp: -1 })
      .limit(count)
      .lean() as unknown as ILocationPing[];
  }

  /**
   * Run anomaly detection asynchronously.
   */
  private async runAnomalyDetection(touristId: string): Promise<void> {
    const recentPings = await this.getRecentSequence(touristId);

    if (recentPings.length < 5) return; // Need minimum sequence

    await anomalyService.analyzeSequence(touristId, recentPings);
  }
}

export const locationService = new LocationService();
