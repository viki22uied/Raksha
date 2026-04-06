import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  email?: string;
}

export interface ITouristProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  nationality: string;
  passportNumber?: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup?: string;
  medicalNotes?: string;
  allergies?: string[];
  emergencyContacts: IEmergencyContact[];
  travelStartDate?: Date;
  travelEndDate?: Date;
  accommodation?: string;
  lastKnownLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  isOnline: boolean;
  deviceInfo?: {
    platform: string;
    model: string;
    osVersion: string;
    appVersion: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
    email: String,
  },
  { _id: false }
);

const TouristProfileSchema = new Schema<ITouristProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    passportNumber: {
      type: String,
      trim: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    medicalNotes: String,
    allergies: [String],
    emergencyContacts: {
      type: [EmergencyContactSchema],
      default: [],
    },
    travelStartDate: Date,
    travelEndDate: Date,
    accommodation: String,
    lastKnownLocation: {
      lat: Number,
      lng: Number,
      timestamp: Date,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    deviceInfo: {
      platform: String,
      model: String,
      osVersion: String,
      appVersion: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

TouristProfileSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

export const TouristProfile = mongoose.model<ITouristProfile>('TouristProfile', TouristProfileSchema);
