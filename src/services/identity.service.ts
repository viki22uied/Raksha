import crypto from 'crypto';
import { Types } from 'mongoose';
import { IdentityDoc, IIdentityDoc } from '../models/IdentityDoc';
import { TouristProfile } from '../models/TouristProfile';
import { User } from '../models/User';
import { ipfsService } from './ipfs.service';
import { ethereumService } from './ethereum.service';
import { AppError } from '../middlewares/error.middleware';
import { IDENTITY_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class IdentityService {
  /**
   * Generate a DID (Decentralized Identifier) for a tourist.
   */
  generateDID(touristId: string): string {
    return `did:raksha:${touristId}:${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  }

  /**
   * Create an identity record.
   */
  async createIdentity(
    touristId: string,
    documentType: string
  ): Promise<{ did: string; message: string }> {
    const user = await User.findById(touristId);
    if (!user) {
      throw new AppError('Tourist not found', 404);
    }

    const did = this.generateDID(touristId);

    logger.info(`Identity DID generated for tourist ${touristId}: ${did}`);
    return {
      did,
      message: 'DID generated. Upload your document to complete identity registration.',
    };
  }

  /**
   * Upload identity document.
   */
  async uploadDocument(
    touristId: string,
    documentType: string,
    file: Express.Multer.File
  ): Promise<IIdentityDoc> {
    // Generate content hash
    const contentHash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // Generate DID
    const did = this.generateDID(touristId);

    // Upload to IPFS
    let ipfsCid: string | undefined;
    let ipfsUrl: string | undefined;
    try {
      const ipfsResult = await ipfsService.uploadBuffer(file.buffer, file.originalname);
      ipfsCid = ipfsResult.cid;
      ipfsUrl = ipfsResult.url;
    } catch (error) {
      logger.warn(error, 'IPFS upload failed, storing metadata only');
    }

    // Anchor hash on Ethereum (optional)
    let ethereumTxHash: string | undefined;
    let ethereumBlockNumber: number | undefined;
    try {
      const txResult = await ethereumService.anchorHash(contentHash, did);
      ethereumTxHash = txResult.txHash;
      ethereumBlockNumber = txResult.blockNumber;
    } catch (error) {
      logger.warn(error, 'Ethereum anchoring failed, storing without blockchain anchor');
    }

    // Create identity document record
    const identityDoc = await IdentityDoc.create({
      touristId: new Types.ObjectId(touristId),
      did,
      documentType,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      ipfsCid,
      ipfsUrl,
      ethereumTxHash,
      ethereumBlockNumber,
      contentHash,
      verificationStatus: IDENTITY_STATUS.PENDING,
    });

    logger.info(`Identity document uploaded: ${did} (${documentType})`);
    return identityDoc;
  }

  /**
   * Get identity documents for a tourist.
   */
  async getDocuments(touristId: string): Promise<IIdentityDoc[]> {
    return IdentityDoc.find({ touristId: new Types.ObjectId(touristId) })
      .sort({ createdAt: -1 })
      .lean() as unknown as IIdentityDoc[];
  }

  /**
   * Verify an identity document.
   */
  async verifyDocument(
    touristId: string,
    verifiedBy: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<IIdentityDoc> {
    const doc = await IdentityDoc.findOne({
      touristId: new Types.ObjectId(touristId),
      verificationStatus: IDENTITY_STATUS.PENDING,
    });

    if (!doc) {
      throw new AppError('No pending identity document found', 404);
    }

    doc.verificationStatus = approved ? IDENTITY_STATUS.VERIFIED : IDENTITY_STATUS.REJECTED;
    doc.verifiedAt = new Date();
    doc.verifiedBy = new Types.ObjectId(verifiedBy);
    if (!approved && rejectionReason) {
      doc.rejectionReason = rejectionReason;
    }
    await doc.save();

    logger.info(`Identity ${doc.did} ${approved ? 'verified' : 'rejected'} by ${verifiedBy}`);
    return doc;
  }

  /**
   * Get emergency packet for identity retrieval.
   */
  async getEmergencyPacket(touristId: string): Promise<Record<string, any>> {
    const [docs, profile, user] = await Promise.all([
      IdentityDoc.find({
        touristId: new Types.ObjectId(touristId),
        verificationStatus: IDENTITY_STATUS.VERIFIED,
      }).lean(),
      TouristProfile.findOne({ userId: touristId }).lean(),
      User.findById(touristId).lean(),
    ]);

    if (!user) {
      throw new AppError('Tourist not found', 404);
    }

    return {
      tourist: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      profile: profile
        ? {
            nationality: profile.nationality,
            passportNumber: profile.passportNumber,
            bloodGroup: profile.bloodGroup,
            emergencyContacts: profile.emergencyContacts,
            medicalNotes: profile.medicalNotes,
            allergies: profile.allergies,
          }
        : null,
      identityDocuments: docs.map((d) => ({
        did: d.did,
        documentType: d.documentType,
        verificationStatus: d.verificationStatus,
        ipfsCid: d.ipfsCid,
        ipfsUrl: d.ipfsUrl,
        contentHash: d.contentHash,
        verifiedAt: d.verifiedAt,
      })),
      lastKnownLocation: profile?.lastKnownLocation,
      retrievedAt: new Date(),
    };
  }
}

export const identityService = new IdentityService();
