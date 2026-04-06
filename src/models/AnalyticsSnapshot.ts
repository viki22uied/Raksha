import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IZoneMetrics {
  zoneId: Types.ObjectId;
  zoneName: string;
  occupancy: number;
  breachCount: number;
  riskScore: number;
}

export interface IAnalyticsSnapshot extends Document {
  _id: Types.ObjectId;
  date: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';

  // Tourist metrics
  totalTourists: number;
  activeTourists: number;
  newRegistrations: number;

  // Alert metrics
  totalAlerts: number;
  pendingAlerts: number;
  resolvedAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  averageResponseTimeSeconds: number;
  averageResolutionTimeSeconds: number;
  resolutionRate: number;

  // Anomaly metrics
  totalAnomalies: number;
  anomaliesByType: Record<string, number>;
  averageAnomalyScore: number;

  // SOS metrics
  totalSosEvents: number;
  activeSosEvents: number;
  falseAlarmRate: number;

  // Zone metrics
  zoneMetrics: IZoneMetrics[];

  // Location metrics
  totalLocationPings: number;
  averageSpeed: number;
  coverageArea: number;

  // System metrics
  uptime: number;
  apiResponseTimeMs: number;

  createdAt: Date;
}

const ZoneMetricsSchema = new Schema<IZoneMetrics>(
  {
    zoneId: { type: Schema.Types.ObjectId, ref: 'GeoFence' },
    zoneName: String,
    occupancy: { type: Number, default: 0 },
    breachCount: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      required: true,
    },
    totalTourists: { type: Number, default: 0 },
    activeTourists: { type: Number, default: 0 },
    newRegistrations: { type: Number, default: 0 },
    totalAlerts: { type: Number, default: 0 },
    pendingAlerts: { type: Number, default: 0 },
    resolvedAlerts: { type: Number, default: 0 },
    alertsByType: { type: Schema.Types.Mixed, default: {} },
    alertsBySeverity: { type: Schema.Types.Mixed, default: {} },
    averageResponseTimeSeconds: { type: Number, default: 0 },
    averageResolutionTimeSeconds: { type: Number, default: 0 },
    resolutionRate: { type: Number, default: 0 },
    totalAnomalies: { type: Number, default: 0 },
    anomaliesByType: { type: Schema.Types.Mixed, default: {} },
    averageAnomalyScore: { type: Number, default: 0 },
    totalSosEvents: { type: Number, default: 0 },
    activeSosEvents: { type: Number, default: 0 },
    falseAlarmRate: { type: Number, default: 0 },
    zoneMetrics: { type: [ZoneMetricsSchema], default: [] },
    totalLocationPings: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 0 },
    coverageArea: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 },
    apiResponseTimeMs: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AnalyticsSnapshotSchema.index({ date: -1, period: 1 });

export const AnalyticsSnapshot = mongoose.model<IAnalyticsSnapshot>(
  'AnalyticsSnapshot',
  AnalyticsSnapshotSchema
);
