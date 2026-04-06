import mongoose, { Schema, Document, Types } from 'mongoose';
import { ANOMALY_TYPE, AnomalyType, ALERT_SEVERITY, AlertSeverity } from '../utils/constants';

export interface ISequencePoint {
  lat: number;
  lng: number;
  speed: number;
  timeDelta: number;
  accelerationMagnitude: number;
}

export interface IAnomaly extends Document {
  _id: Types.ObjectId;
  touristId: Types.ObjectId;
  sequenceInput: ISequencePoint[];
  anomalyType: AnomalyType;
  score: number;
  severity: AlertSeverity;
  reason: string;
  location: {
    lat: number;
    lng: number;
  };
  linkedAlertId?: Types.ObjectId;
  isProcessed: boolean;
  modelVersion?: string;
  rawPrediction?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

const SequencePointSchema = new Schema<ISequencePoint>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, required: true },
    timeDelta: { type: Number, required: true },
    accelerationMagnitude: { type: Number, required: true },
  },
  { _id: false }
);

const AnomalySchema = new Schema<IAnomaly>(
  {
    touristId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sequenceInput: {
      type: [SequencePointSchema],
      required: true,
    },
    anomalyType: {
      type: String,
      enum: Object.values(ANOMALY_TYPE),
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    severity: {
      type: String,
      enum: Object.values(ALERT_SEVERITY),
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    linkedAlertId: {
      type: Schema.Types.ObjectId,
      ref: 'Alert',
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    modelVersion: String,
    rawPrediction: Schema.Types.Mixed,
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AnomalySchema.index({ anomalyType: 1, timestamp: -1 });
AnomalySchema.index({ score: -1 });

export const Anomaly = mongoose.model<IAnomaly>('Anomaly', AnomalySchema);
