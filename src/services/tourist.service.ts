import { Types } from 'mongoose';
import { TouristProfile, ITouristProfile } from '../models/TouristProfile';
import { User } from '../models/User';
import { AppError } from '../middlewares/error.middleware';
import { ROLES, PAGINATION } from '../utils/constants';
import { logger } from '../utils/logger';

class TouristService {
  /**
   * Get all tourists with pagination.
   */
  async getAll(page: number = PAGINATION.DEFAULT_PAGE as number, limit: number = PAGINATION.DEFAULT_LIMIT as number): Promise<{
    tourists: ITouristProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const [tourists, total] = await Promise.all([
      TouristProfile.find()
        .populate('userId', 'name email phone role isActive lastLogin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TouristProfile.countDocuments(),
    ]);

    return {
      tourists: tourists as unknown as ITouristProfile[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get tourist by user ID.
   */
  async getById(userId: string): Promise<ITouristProfile> {
    const profile = await TouristProfile.findOne({ userId })
      .populate('userId', 'name email phone role isActive lastLogin');

    if (!profile) {
      throw new AppError('Tourist profile not found', 404);
    }

    return profile;
  }

  /**
   * Update tourist profile.
   */
  async update(userId: string, updateData: Partial<ITouristProfile>): Promise<ITouristProfile> {
    const profile = await TouristProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone role isActive');

    if (!profile) {
      throw new AppError('Tourist profile not found', 404);
    }

    logger.info(`Tourist profile updated: ${userId}`);
    return profile;
  }

  /**
   * Update last known location.
   */
  async updateLocation(
    userId: string,
    lat: number,
    lng: number
  ): Promise<void> {
    await TouristProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          lastKnownLocation: { lat, lng, timestamp: new Date() },
          isOnline: true,
        },
      }
    );
  }

  /**
   * Set tourist online/offline status.
   */
  async setOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    await TouristProfile.findOneAndUpdate(
      { userId },
      { $set: { isOnline } }
    );
  }

  /**
   * Get active/online tourists.
   */
  async getActiveTourists(): Promise<ITouristProfile[]> {
    return TouristProfile.find({ isOnline: true })
      .populate('userId', 'name email phone')
      .lean() as unknown as ITouristProfile[];
  }

  /**
   * Get emergency packet for a tourist.
   */
  async getEmergencyPacket(userId: string): Promise<Record<string, any>> {
    const profile = await TouristProfile.findOne({ userId })
      .populate('userId', 'name email phone');

    if (!profile) {
      throw new AppError('Tourist profile not found', 404);
    }

    const user = await User.findById(userId);

    return {
      personalInfo: {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        nationality: profile.nationality,
        passportNumber: profile.passportNumber,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
      },
      medical: {
        bloodGroup: profile.bloodGroup,
        medicalNotes: profile.medicalNotes,
        allergies: profile.allergies,
      },
      emergencyContacts: profile.emergencyContacts,
      lastKnownLocation: profile.lastKnownLocation,
      travel: {
        startDate: profile.travelStartDate,
        endDate: profile.travelEndDate,
        accommodation: profile.accommodation,
      },
    };
  }
}

export const touristService = new TouristService();
