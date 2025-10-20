import { prisma } from '../../config/prismaClient';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { Shop } from '../../types/types';
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

class ShopService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async isShopEmailExists(email: string) {
    return await this.prisma.shop.findUnique({
      where: { email },
    });
  }

  async generateJwtTokenForShop(shop: Shop): Promise<string> {
    const secret: Secret | undefined = process.env.SHOP_VERIFICATION_SECRET_KEY;
    if (!secret) {
      throw new Error(
        'SHOP_VERIFICATION_SECRET_KEY is not defined in environment'
      );
    }

    const options: SignOptions = {
      expiresIn: (process.env.SHOP_VERIFICATION_EXPIRY_DATE ||
        '15m') as SignOptions['expiresIn'],
    };

    return jwt.sign(shop, secret, options);
  }

  async createShop(shopData: Shop) {
    const { name, email, password, phoneNumber, description } = shopData;

    return await this.prisma.shop.create({
      data: {
        name,
        email,
        password,
        description,
        phoneNumber,
        verified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        description: true,
        avatar: true,
        createdAt: true,
        verified: true,
      },
    });
  }

  async generateShopAccessToken(shopId: number) {
    const secret: Secret | undefined = process.env.SELLER_ACCESS_SECRET_KEY;
    if (!secret) {
      throw new Error('SELLER_ACCESS_SECRET_KEY is not defined in environment');
    }

    const options: SignOptions = {
      expiresIn:
        (process.env.SELLER_ACCESS_EXPIRY_DATE as SignOptions['expiresIn']) ||
        '15m',
    };

    const payload = { id: shopId } as Record<string, unknown>;

    return jwt.sign(payload, secret, options) as string;
  }

  async generateShopRefreshToken(userId: number) {
    const secret: Secret | undefined = process.env.SHOP_REFRESH_SECRET_KEY;

    if (!secret) {
      throw new Error('SHOP_REFRESH_SECRET_KEY is not defined in environment');
    }

    const option: SignOptions = {
      expiresIn:
        (process.env.SHOP_REFRESH_EXPIRY_DATE as SignOptions['expiresIn']) ||
        '7d',
    };

    const payload = { id: userId } as Record<string, unknown>;

    return jwt.sign(payload, secret, option) as string;
  }

  async saveShopRefreshToken(shopId: number, refreshToken: string) {
    return this.prisma.shop.update({
      where: { id: shopId },
      data: { refreshToken },
    });
  }

  async generateShopPasswordResetToken(userId: number) {
    const secret: Secret | undefined =
      process.env.SHOP_RESET_PASSWORD_SECRET_KEY;
    if (!secret) {
      throw new Error(
        'SHOP_RESET_PASSWORD_SECRET_KEY is not defined in environment'
      );
    }

    const options: SignOptions = {
      expiresIn:
        (process.env
          .SHOP_RESET_PASSWORD_EXPIRY_DATE as SignOptions['expiresIn']) ||
        '10m',
    };

    const payload = { id: userId } as Record<string, unknown>;

    return jwt.sign(payload, secret, options) as string;
  }

  async getShopById(shopId: number) {
    return await this.prisma.shop.findUnique({
      where: { id: shopId },
    });
  }
  async updateShopPassword(shopId: number, hashedPassword: string) {
    return await this.prisma.shop.update({
      where: { id: shopId },
      data: { password: hashedPassword },
    });
  }

  async updateShop(
    shopId: number,
    payload: Partial<
      Pick<Shop, 'name' | 'password' | 'avatar' | 'phoneNumber' | 'description'>
    >
  ) {
    return this.prisma.shop.update({
      where: { id: shopId },
      data: payload,
    });
  }
}

export const shopService = new ShopService(prisma);
