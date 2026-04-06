import { ILocationPing } from '../models/LocationPing';
import { Anomaly, IAnomaly, ISequencePoint } from '../models/Anomaly';
import { alertService } from './alert.service';
import { lstmService } from '@services/lstm.service';
import { websocketService } from './websocket.service';
import {
  ANOMALY_TYPE,
  ANOMALY_THRESHOLDS,
  ALERT_TYPE,
  ALERT_SEVERITY,
  WS_EVENTS,
} from '../utils/constants';
import { haversineDistance } from '../utils/geo';
import { timeDiffSeconds } from '../utils/time';
import { logger } from '../utils/logger';
import { Types } from 'mongoose';

class AnomalyService {
  /**
   * Analyze a sequence of recent pings for anomalies.
   */
  async analyzeSequence(touristId: string, pings: ILocationPing[]): Promise<IAnomaly | null> {
    if (pings.length < 5) return null;

    // Reverse so oldest is first
    const orderedPings = [...pings].reverse();

    // Build sequence for LSTM
    const sequence = this.buildSequence(orderedPings);

    // Get LSTM prediction
    const prediction = await lstmService.predictSequence(sequence);

    // Also run rule-based checks
    const ruleResult = this.runRuleBasedChecks(orderedPings);

    // Combine LSTM score with rule-based checks
    const combinedScore = Math.max(prediction.score, ruleResult.score);
    const anomalyType = ruleResult.type || prediction.label;
    const reason = ruleResult.reason || prediction.reason;

    // Only flag if above threshold
    if (combinedScore < ANOMALY_THRESHOLDS.SCORE_LOW) {
      return null;
    }

    // Determine severity from score
    let severity: any = ALERT_SEVERITY.LOW;
    if (combinedScore >= ANOMALY_THRESHOLDS.SCORE_HIGH) severity = ALERT_SEVERITY.CRITICAL;
    else if (combinedScore >= ANOMALY_THRESHOLDS.SCORE_MEDIUM) severity = ALERT_SEVERITY.HIGH;
    else if (combinedScore >= ANOMALY_THRESHOLDS.SCORE_LOW) severity = ALERT_SEVERITY.MEDIUM;

    const lastPing = orderedPings[orderedPings.length - 1];

    // Save anomaly
    const anomaly = await Anomaly.create({
      touristId: new Types.ObjectId(touristId),
      sequenceInput: sequence,
      anomalyType,
      score: combinedScore,
      severity,
      reason,
      location: { lat: lastPing.lat, lng: lastPing.lng },
      modelVersion: 'rule-based-v1',
      rawPrediction: { lstm: prediction, rules: ruleResult },
      timestamp: new Date(),
    });

    // Create alert if score is high enough
    if (combinedScore >= ANOMALY_THRESHOLDS.SCORE_MEDIUM) {
      const alert = await alertService.create({
        type: ALERT_TYPE.ANOMALY,
        severity,
        cause: `Anomaly detected: ${reason}`,
        description: `Anomaly type: ${anomalyType}, Score: ${combinedScore.toFixed(2)}`,
        touristId,
        location: { lat: lastPing.lat, lng: lastPing.lng },
        anomalyId: anomaly._id.toString(),
      });

      anomaly.linkedAlertId = alert._id as Types.ObjectId;
      anomaly.isProcessed = true;
      await anomaly.save();
    }

    // Emit WebSocket event
    websocketService.emitToAdmin(WS_EVENTS.ANOMALY_DETECTED, {
      anomalyId: anomaly._id,
      touristId,
      type: anomalyType,
      score: combinedScore,
      severity,
      reason,
      location: { lat: lastPing.lat, lng: lastPing.lng },
      timestamp: new Date(),
    });

    logger.warn(`Anomaly detected for tourist ${touristId}: ${anomalyType} (score: ${combinedScore.toFixed(2)})`);
    return anomaly;
  }

  /**
   * Build sequence input from pings for LSTM model.
   */
  private buildSequence(pings: ILocationPing[]): ISequencePoint[] {
    const sequence: ISequencePoint[] = [];

    for (let i = 1; i < pings.length; i++) {
      const prev = pings[i - 1];
      const curr = pings[i];

      const timeDelta = timeDiffSeconds(
        new Date(prev.timestamp),
        new Date(curr.timestamp)
      );

      const accelMag = curr.accelerometer
        ? Math.sqrt(
            curr.accelerometer.x ** 2 +
            curr.accelerometer.y ** 2 +
            curr.accelerometer.z ** 2
          )
        : 0;

      sequence.push({
        lat: curr.lat,
        lng: curr.lng,
        speed: curr.speed || 0,
        timeDelta,
        accelerationMagnitude: accelMag,
      });
    }

    return sequence;
  }

  /**
   * Rule-based anomaly checks.
   */
  private runRuleBasedChecks(pings: ILocationPing[]): {
    score: number;
    type: string;
    reason: string;
  } {
    let maxScore = 0;
    let detectedType: any = ANOMALY_TYPE.ERRATIC_MOVEMENT;
    let reason = '';

    // Check for sudden stop
    const suddenStopResult = this.checkSuddenStop(pings);
    if (suddenStopResult.score > maxScore) {
      maxScore = suddenStopResult.score;
      detectedType = ANOMALY_TYPE.SUDDEN_STOP;
      reason = suddenStopResult.reason;
    }

    // Check for prolonged stationary
    const stationaryResult = this.checkProlongedStationary(pings);
    if (stationaryResult.score > maxScore) {
      maxScore = stationaryResult.score;
      detectedType = ANOMALY_TYPE.PROLONGED_STATIONARY;
      reason = stationaryResult.reason;
    }

    // Check for erratic movement
    const erraticResult = this.checkErraticMovement(pings);
    if (erraticResult.score > maxScore) {
      maxScore = erraticResult.score;
      detectedType = ANOMALY_TYPE.ERRATIC_MOVEMENT;
      reason = erraticResult.reason;
    }

    // Check for route drift
    const driftResult = this.checkRouteDrift(pings);
    if (driftResult.score > maxScore) {
      maxScore = driftResult.score;
      detectedType = ANOMALY_TYPE.ROUTE_DRIFT;
      reason = driftResult.reason;
    }

    return { score: maxScore, type: detectedType, reason };
  }

  private checkSuddenStop(pings: ILocationPing[]): { score: number; reason: string } {
    if (pings.length < 3) return { score: 0, reason: '' };

    const recent = pings.slice(-3);
    const speeds = recent.map((p) => p.speed || 0);

    // Moving fast then stopped
    if (speeds[0] > 30 && speeds[2] < 2) {
      const score = Math.min(1, speeds[0] / 100);
      return {
        score,
        reason: `Sudden stop from ${speeds[0].toFixed(1)} km/h to ${speeds[2].toFixed(1)} km/h`,
      };
    }

    return { score: 0, reason: '' };
  }

  private checkProlongedStationary(pings: ILocationPing[]): { score: number; reason: string } {
    if (pings.length < 5) return { score: 0, reason: '' };

    const first = pings[0];
    const last = pings[pings.length - 1];
    const distance = haversineDistance(
      { lat: first.lat, lng: first.lng },
      { lat: last.lat, lng: last.lng }
    );
    const timeDiff = timeDiffSeconds(
      new Date(first.timestamp),
      new Date(last.timestamp)
    );
    const minutes = timeDiff / 60;

    if (distance < 50 && minutes > ANOMALY_THRESHOLDS.STATIONARY_MINUTES) {
      const score = Math.min(1, minutes / 120);
      return {
        score,
        reason: `Stationary for ${Math.round(minutes)} minutes within ${Math.round(distance)}m radius`,
      };
    }

    return { score: 0, reason: '' };
  }

  private checkErraticMovement(pings: ILocationPing[]): { score: number; reason: string } {
    if (pings.length < 5) return { score: 0, reason: '' };

    const speeds = pings.map((p) => p.speed || 0);
    let speedChanges = 0;

    for (let i = 1; i < speeds.length; i++) {
      const change = Math.abs(speeds[i] - speeds[i - 1]);
      if (change > ANOMALY_THRESHOLDS.SPEED_ERRATIC_THRESHOLD) {
        speedChanges++;
      }
    }

    if (speedChanges >= 3) {
      const score = Math.min(1, speedChanges / 5);
      return {
        score,
        reason: `Erratic speed changes: ${speedChanges} rapid variations detected`,
      };
    }

    return { score: 0, reason: '' };
  }

  private checkRouteDrift(pings: ILocationPing[]): { score: number; reason: string } {
    if (pings.length < 5) return { score: 0, reason: '' };

    // Check if person is drifting away from a central area
    const midIdx = Math.floor(pings.length / 2);
    const center = pings[midIdx];
    const last = pings[pings.length - 1];

    const drift = haversineDistance(
      { lat: center.lat, lng: center.lng },
      { lat: last.lat, lng: last.lng }
    );

    if (drift > ANOMALY_THRESHOLDS.DRIFT_DISTANCE_METERS) {
      const score = Math.min(1, drift / 2000);
      return {
        score,
        reason: `Route drift of ${Math.round(drift)}m from expected area`,
      };
    }

    return { score: 0, reason: '' };
  }

  /**
   * Get anomaly summaries for a time range.
   */
  async getSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    avgScore: number;
  }> {
    const match: any = {};
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) match.timestamp.$gte = startDate;
      if (endDate) match.timestamp.$lte = endDate;
    }

    const [byType, bySeverity, avgResult] = await Promise.all([
      Anomaly.aggregate([
        { $match: match },
        { $group: { _id: '$anomalyType', count: { $sum: 1 } } },
      ]),
      Anomaly.aggregate([
        { $match: match },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Anomaly.aggregate([
        { $match: match },
        { $group: { _id: null, avg: { $avg: '$score' }, total: { $sum: 1 } } },
      ]),
    ]);

    const typeMap: Record<string, number> = {};
    for (const t of byType) typeMap[t._id] = t.count;

    const severityMap: Record<string, number> = {};
    for (const s of bySeverity) severityMap[s._id] = s.count;

    return {
      total: avgResult[0]?.total || 0,
      byType: typeMap,
      bySeverity: severityMap,
      avgScore: avgResult[0]?.avg || 0,
    };
  }
}

export const anomalyService = new AnomalyService();
