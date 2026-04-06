import mongoose, { Schema, Document, Types } from 'mongoose';
import { ALERT_TYPE, AlertType, ALERT_SEVERITY, AlertSeverity, ALERT_STATUS, AlertStatus } from '../utils/constants';

export interface IAlert extends Document {
  _id: Types.ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  cause: string;
  description?: string;
  touristId: Types.ObjectId;
  location: {
    lat: number;
    lng: number;
  };
  geofenceId?: Types.ObjectId;
  anomalyId?: Types.ObjectId;
  sosEventId?: Types.ObjectId;
  status: AlertStatus;
  assignedTo?: Types.ObjectId;
  assignedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: Types.ObjectId;
  escalatedAt?: Date;
  escalatedBy?: Types.ObjectId;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  resolutionNotes?: string;
  responderEta?: number; // minutes
  responseTime?: number; // seconds from creation to acknowledgment
  resolutionTime?: number; // seconds from creation to resolution
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    type: {
      type: String,
      enum: Object.values(ALERT_TYPE),
      required: true,
    },
    severity: {
      type: String,
      enum: Object.values(ALERT_SEVERITY),
      required: true,
    },
    cause: {
      type: String,
      required: true,
    },
    description: String,
    touristId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    geofenceId: {
      type: Schema.Types.ObjectId,
      ref: 'GeoFence',
    },
    anomalyId: {
      type: Schema.Types.ObjectId,
      ref: 'Anomaly',
    },
    sosEventId: {
      type: Schema.Types.ObjectId,
      ref: 'SosEvent',
    },
    status: {
      type: String,
      enum: Object.values(ALERT_STATUS),
      default: ALERT_STATUS.PENDING,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedAt: Date,
    acknowledgedAt: Date,
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    escalatedAt: Date,
    escalatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: String,
    responderEta: Number,
    responseTime: Number,
    resolutionTime: Number,
    metadata: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AlertSchema.index({ status: 1, severity: 1, timestamp: -1 });
AlertSchema.index({ type: 1, timestamp: -1 });
AlertSchema.index({ assignedTo: 1, status: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
