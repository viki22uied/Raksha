import mongoose, { Schema, Document, Types } from 'mongoose';
import { RISK_LEVEL, RiskLevel } from '../utils/constants';

export interface IGeoFenceCoordinate {
  lat: number;
  lng: number;
}

export interface IGeoFence extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  polygon: IGeoFenceCoordinate[];
  riskLevel: RiskLevel;
  isActive: boolean;
  maxCapacity?: number;
  currentOccupancy: number;
  watchPriority: number;
  metadata?: Record<string, any>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GeoFenceCoordinateSchema = new Schema<IGeoFenceCoordinate>(
  {
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const GeoFenceSchema = new Schema<IGeoFence>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: String,
    polygon: {
      type: [GeoFenceCoordinateSchema],
      required: true,
      validate: {
        validator: (v: IGeoFenceCoordinate[]) => v.length >= 3,
        message: 'A polygon must have at least 3 coordinates',
      },
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVEL),
      default: RISK_LEVEL.SAFE,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxCapacity: Number,
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },
    watchPriority: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    metadata: Schema.Types.Mixed,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

GeoFenceSchema.index({ isActive: 1 });
GeoFenceSchema.index({ riskLevel: 1 });

export const GeoFence = mongoose.model<IGeoFence>('GeoFence', GeoFenceSchema);
