import { prisma } from '../config/prismaClient';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../types/user.types';

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
    });

    return user;
  }
}

export const userService = new UserService(prisma);
