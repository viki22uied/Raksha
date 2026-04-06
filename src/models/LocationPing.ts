import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAccelerometerData {
  x: number;
  y: number;
  z: number;
}

export interface ILocationPing extends Document {
  _id: Types.ObjectId;
  touristId: Types.ObjectId;
  lat: number;
  lng: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  battery?: number;
  accelerometer?: IAccelerometerData;
  zoneId?: Types.ObjectId;
  zoneName?: string;
  isInsideSafeZone?: boolean;
  timestamp: Date;
  createdAt: Date;
}

const LocationPingSchema = new Schema<ILocationPing>(
  {
    touristId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    altitude: Number,
    speed: {
      type: Number,
      min: 0,
    },
    heading: {
      type: Number,
      min: 0,
      max: 360,
    },
    accuracy: Number,
    battery: {
      type: Number,
      min: 0,
      max: 100,
    },
    accelerometer: {
      x: Number,
      y: Number,
      z: Number,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: 'GeoFence',
    },
    zoneName: String,
    isInsideSafeZone: Boolean,
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for efficient queries
LocationPingSchema.index({ touristId: 1, timestamp: -1 });
LocationPingSchema.index({ lat: 1, lng: 1 });
LocationPingSchema.index({ zoneId: 1, timestamp: -1 });

// TTL index — auto-delete pings older than 90 days
LocationPingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const LocationPing = mongoose.model<ILocationPing>('LocationPing', LocationPingSchema);
