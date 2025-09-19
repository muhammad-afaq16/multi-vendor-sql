import { prisma } from '../../config/prismaClient';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../../types/user.types';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

class UserService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async isUserExists(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async uploadToCloudinary(filePath: string) {
    return await cloudinary.uploader.upload(filePath, {
      folder: 'avatars',
    });
  }

  async createUser(data: User) {
    const { name, email, password, phoneNumber, role, avatar } = data;

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        phoneNumber,
        role,
        avatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
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
}

export const userService = new UserService(prisma);
