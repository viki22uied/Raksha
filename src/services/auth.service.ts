import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { TouristProfile } from '../models/TouristProfile';
import { AppError } from '../middlewares/error.middleware';
import { ROLES } from '../utils/constants';
import { logger } from '../utils/logger';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: string;
  nationality?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: IUser;
  token: string;
}

class AuthService {
  /**
   * Register a new user and optionally create a tourist profile.
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);

    const user = await User.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      phone: input.phone,
      role: input.role || ROLES.TOURIST,
    });

    // Create tourist profile if role is tourist
    if (user.role === ROLES.TOURIST) {
      await TouristProfile.create({
        userId: user._id,
        nationality: input.nationality || 'Unknown',
      });
    }

    const token = this.generateToken(user);

    // Remove password from response
    const userObj = user.toJSON();

    logger.info(`User registered: ${user.email} (${user.role})`);
    return { user: userObj as unknown as IUser, token };
  }

  /**
   * Login with email and password.
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);
    const userObj = user.toJSON();

    logger.info(`User logged in: ${user.email}`);
    return { user: userObj as unknown as IUser, token };
  }

  /**
   * Get current user profile.
   */
  async getProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /**
   * Generate JWT token.
   */
  generateToken(user: IUser): string {
    return jwt.sign(
      { userId: user._id.toString(), role: user.role },
      env.JWT_SECRET as string,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  /**
   * Verify JWT token.
   */
  verifyToken(token: string): { userId: string; role: string } {
    try {
      return jwt.verify(token, env.JWT_SECRET as string) as { userId: string; role: string };
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

export const authService = new AuthService();
