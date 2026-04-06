import mongoose, { Schema, Document, Types } from 'mongoose';
import { ADMIN_ACTION_TYPE, AdminActionType } from '../utils/constants';

export interface IAdminAction extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  actionType: AdminActionType;
  targetId?: Types.ObjectId;
  targetModel?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

const AdminActionSchema = new Schema<IAdminAction>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: Object.values(ADMIN_ACTION_TYPE),
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    targetModel: {
      type: String,
      enum: ['Alert', 'GeoFence', 'User', 'SosEvent', 'IdentityDoc', 'AnalyticsSnapshot'],
    },
    description: {
      type: String,
      required: true,
    },
    metadata: Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
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

AdminActionSchema.index({ actionType: 1, timestamp: -1 });
AdminActionSchema.index({ adminId: 1, timestamp: -1 });

export const AdminAction = mongoose.model<IAdminAction>('AdminAction', AdminActionSchema);
