import { prisma } from '../../config/prismaClient';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../../types/user.types';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

class UserService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async isEmailExists(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async userFindById(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async uploadToCloudinary(filePath: string) {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'avatars',
    });
  }

  async createUser(data: User) {
    const { name, email, password, phoneNumber } = data;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        phoneNumber,
        verified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        avatar: true,
        createdAt: true,
        verified: true,
      },
    });

    return user;
  }
  async updateUser(
    userId: number,
    payload: Partial<Pick<User, 'name' | 'password' | 'avatar' | 'phoneNumber'>>
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data: payload,
    });
  }

  async deleteFromCloudinary(publicId: string) {
    return await cloudinary.uploader.destroy(publicId);
  }
  async generateAccessToken(userId: number) {
    const secret: Secret | undefined = process.env.ACCESS_SECRET_KEY;
    if (!secret) {
      throw new Error('ACCESS_SECRET_KEY is not defined in environment');
    }

    const options: SignOptions = {
      expiresIn:
        (process.env.ACCESS_EXPIRY_DATE as SignOptions['expiresIn']) || '15m',
    };

    const payload = { id: userId } as Record<string, unknown>;

    return jwt.sign(payload, secret, options) as string;
  }
  async generatePasswordResetToken(userId: number) {
    const secret: Secret | undefined = process.env.RESET_PASSWORD_SECRET_KEY;
    if (!secret) {
      throw new Error(
        'RESET_PASSWORD_SECRET_KEY is not defined in environment'
      );
    }

    const options: SignOptions = {
      expiresIn:
        (process.env.RESET_PASSWORD_EXPIRY_DATE as SignOptions['expiresIn']) ||
        '10m',
    };

    const payload = { id: userId } as Record<string, unknown>;

    return jwt.sign(payload, secret, options) as string;
  }
  async generateRefreshToken(userId: number) {
    const secret: Secret | undefined = process.env.REFRESH_SECRET_KEY;

    if (!secret) {
      throw new Error('REFRESH_DUDE_SECRET_KEY is not defined in environment');
    }

    const option: SignOptions = {
      expiresIn:
        (process.env.REFRESH_EXPIRY_DATE as SignOptions['expiresIn']) || '7d',
    };

    const payload = { id: userId } as Record<string, unknown>;

    return jwt.sign(payload, secret, option) as string;
  }

  async saveRefreshToken(userId: number, refreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async generateVerificationToken(user: User): Promise<string> {
    const secret: Secret | undefined = process.env.VERIFICATION_SECRET_KEY;
    if (!secret) {
      throw new Error('VERIFICATION_SECRET_KEY is not defined in environment');
    }

    const options: SignOptions = {
      expiresIn: (process.env.VERIFICATION_EXPIRY_DATE ||
        '15m') as SignOptions['expiresIn'],
    };

    return jwt.sign(user, secret, options);
  }

  async verifyEmailToken(token: string): Promise<JwtPayload | string> {
    const secret: Secret | undefined = process.env.VERIFICATION_SECRET_KEY;
    if (!secret) {
      throw new Error('VERIFICATION_SECRET_KEY is not defined');
    }
    return jwt.verify(token, secret);
  }

  async verifyResetPassToken(token: string): Promise<JwtPayload | string> {
    const secret: Secret | undefined = process.env.RESET_PASSWORD_SECRET_KEY;

    if (!secret) {
      throw new Error('RESET_PASSWORD_SECRET_KEY is not defined');
    }

    return jwt.verify(token, secret);
  }

  async markEmailAsVerified(userId: number) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { verified: true },
    });
  }

  async verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.ACCESS_SECRET_KEY!);
  }

  async getAllUsers() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        addresses: true,
      },
    });
  }

  async updatePassword(userId: number, password: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        password,
      },
    });
  }
}

export const userService = new UserService(prisma);
