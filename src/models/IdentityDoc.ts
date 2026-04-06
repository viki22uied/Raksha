import mongoose, { Schema, Document, Types } from 'mongoose';
import { IDENTITY_STATUS, IdentityStatus } from '../utils/constants';

export interface IIdentityDoc extends Document {
  _id: Types.ObjectId;
  touristId: Types.ObjectId;
  did: string; // Decentralized Identifier
  documentType: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  ipfsCid?: string;
  ipfsUrl?: string;
  ethereumTxHash?: string;
  ethereumBlockNumber?: number;
  contentHash: string;
  verificationStatus: IdentityStatus;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  rejectionReason?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const IdentityDocSchema = new Schema<IIdentityDoc>(
  {
    touristId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    did: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ['passport', 'national_id', 'driving_license', 'visa', 'other'],
    },
    originalFilename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    ipfsCid: String,
    ipfsUrl: String,
    ethereumTxHash: String,
    ethereumBlockNumber: Number,
    contentHash: {
      type: String,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(IDENTITY_STATUS),
      default: IDENTITY_STATUS.PENDING,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    expiresAt: Date,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

IdentityDocSchema.index({ verificationStatus: 1 });
IdentityDocSchema.index({ touristId: 1, documentType: 1 });

export const IdentityDoc = mongoose.model<IIdentityDoc>('IdentityDoc', IdentityDocSchema);
