import mongoose, { Schema, Document, Types } from 'mongoose';
import { SOS_STATUS, SosStatus } from '../utils/constants';

export interface ISosEvent extends Document {
  _id: Types.ObjectId;
  touristId: Types.ObjectId;
  location: {
    lat: number;
    lng: number;
    altitude?: number;
    accuracy?: number;
  };
  status: SosStatus;
  message?: string;
  mediaUrls?: string[];
  battery?: number;
  linkedAlertId?: Types.ObjectId;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  resolutionNotes?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SosEventSchema = new Schema<ISosEvent>(
  {
    touristId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      altitude: Number,
      accuracy: Number,
    },
    status: {
      type: String,
      enum: Object.values(SOS_STATUS),
      default: SOS_STATUS.ACTIVE,
    },
    message: String,
    mediaUrls: [String],
    battery: {
      type: Number,
      min: 0,
      max: 100,
    },
    linkedAlertId: {
      type: Schema.Types.ObjectId,
      ref: 'Alert',
    },
    resolvedAt: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: String,
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

SosEventSchema.index({ status: 1, timestamp: -1 });

export const SosEvent = mongoose.model<ISosEvent>('SosEvent', SosEventSchema);
