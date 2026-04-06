import { Types } from 'mongoose';
import { GeoFence, IGeoFence } from '../models/GeoFence';
import { isPointInPolygon, distanceToPolygonEdge, Coordinate } from '../utils/geo';
import { alertService } from './alert.service';
import { websocketService } from './websocket.service';
import { ALERT_TYPE, ALERT_SEVERITY, WS_EVENTS } from '../utils/constants';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

export interface ZoneCheckResult {
  zoneId: Types.ObjectId;
  zoneName: string;
  riskLevel: string;
  isInside: boolean;
  distanceToEdge: number;
}

class GeofenceService {
  /**
   * Create a new geofence.
   */
  async create(data: Partial<IGeoFence>, createdBy: string): Promise<IGeoFence> {
    const geofence = await GeoFence.create({
      ...data,
      createdBy: new Types.ObjectId(createdBy),
    });

    logger.info(`Geofence created: ${geofence.name} (${geofence._id})`);
    return geofence;
  }

  /**
   * Get all geofences.
   */
  async getAll(activeOnly = false): Promise<IGeoFence[]> {
    const query = activeOnly ? { isActive: true } : {};
    return GeoFence.find(query)
      .populate('createdBy', 'name email')
      .sort({ watchPriority: -1, createdAt: -1 })
      .lean() as unknown as IGeoFence[];
  }

  /**
   * Get geofence by ID.
   */
  async getById(id: string): Promise<IGeoFence> {
    const geofence = await GeoFence.findById(id)
      .populate('createdBy', 'name email');

    if (!geofence) {
      throw new AppError('Geofence not found', 404);
    }

    return geofence;
  }

  /**
   * Update a geofence.
   */
  async update(id: string, data: Partial<IGeoFence>): Promise<IGeoFence> {
    const geofence = await GeoFence.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!geofence) {
      throw new AppError('Geofence not found', 404);
    }

    logger.info(`Geofence updated: ${geofence.name}`);
    return geofence;
  }

  /**
   * Delete a geofence (soft delete by deactivating).
   */
  async delete(id: string): Promise<void> {
    const geofence = await GeoFence.findByIdAndUpdate(id, { isActive: false });
    if (!geofence) {
      throw new AppError('Geofence not found', 404);
    }
    logger.info(`Geofence deactivated: ${geofence.name}`);
  }

  /**
   * Check if a point is inside any active geofence.
   */
  async checkPoint(lat: number, lng: number): Promise<ZoneCheckResult | null> {
    const activeGeofences = await GeoFence.find({ isActive: true }).lean();
    const point: Coordinate = { lat, lng };

    for (const fence of activeGeofences) {
      const polygon = fence.polygon.map((p) => ({ lat: p.lat, lng: p.lng }));
      const isInside = isPointInPolygon(point, polygon);
      const distanceToEdge = distanceToPolygonEdge(point, polygon);

      if (isInside || distanceToEdge < 100) {
        // Within zone or within 100m of boundary
        return {
          zoneId: fence._id as Types.ObjectId,
          zoneName: fence.name,
          riskLevel: fence.riskLevel,
          isInside,
          distanceToEdge,
        };
      }
    }

    return null;
  }

  /**
   * Check all zones for a given point and return full results.
   */
  async checkAllZones(lat: number, lng: number): Promise<ZoneCheckResult[]> {
    const activeGeofences = await GeoFence.find({ isActive: true }).lean();
    const point: Coordinate = { lat, lng };
    const results: ZoneCheckResult[] = [];

    for (const fence of activeGeofences) {
      const polygon = fence.polygon.map((p) => ({ lat: p.lat, lng: p.lng }));
      const isInside = isPointInPolygon(point, polygon);
      const distanceToEdge = distanceToPolygonEdge(point, polygon);

      results.push({
        zoneId: fence._id as Types.ObjectId,
        zoneName: fence.name,
        riskLevel: fence.riskLevel,
        isInside,
        distanceToEdge,
      });
    }

    return results;
  }

  /**
   * Handle a geofence breach.
   */
  async handleBreach(
    touristId: string,
    lat: number,
    lng: number,
    zoneInfo: ZoneCheckResult
  ): Promise<void> {
    // Determine severity based on risk level
    let severity: any = ALERT_SEVERITY.LOW;
    if (zoneInfo.riskLevel === 'danger') severity = ALERT_SEVERITY.HIGH;
    else if (zoneInfo.riskLevel === 'restricted') severity = ALERT_SEVERITY.CRITICAL;
    else if (zoneInfo.riskLevel === 'caution') severity = ALERT_SEVERITY.MEDIUM;

    // Create alert for geofence breach
    const alert = await alertService.create({
      type: ALERT_TYPE.GEOFENCE_BREACH,
      severity,
      cause: `Tourist exited ${zoneInfo.zoneName} zone (${zoneInfo.riskLevel} area)`,
      description: `Tourist left the ${zoneInfo.zoneName} geofence. Distance to boundary: ${Math.round(zoneInfo.distanceToEdge)}m`,
      touristId,
      location: { lat, lng },
      geofenceId: zoneInfo.zoneId.toString(),
    });

    // Emit WebSocket breach event
    websocketService.emitToAdmin(WS_EVENTS.GEOFENCE_BREACH, {
      touristId,
      zoneId: zoneInfo.zoneId,
      zoneName: zoneInfo.zoneName,
      riskLevel: zoneInfo.riskLevel,
      lat,
      lng,
      alertId: alert._id,
      timestamp: new Date(),
    });

    logger.warn(`Geofence breach detected: tourist ${touristId} left ${zoneInfo.zoneName}`);
  }

  /**
   * Update zone occupancy count.
   */
  async updateOccupancy(zoneId: string, delta: number): Promise<void> {
    await GeoFence.findByIdAndUpdate(zoneId, {
      $inc: { currentOccupancy: delta },
    });
  }

  /**
   * Get zone pressure (occupancy relative to capacity).
   */
  async getZonePressure(zoneId: string): Promise<number> {
    const zone = await GeoFence.findById(zoneId);
    if (!zone || !zone.maxCapacity) return 0;
    return zone.currentOccupancy / zone.maxCapacity;
  }
}

export const geofenceService = new GeofenceService();
