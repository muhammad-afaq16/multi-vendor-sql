import { prisma } from '../../config/prismaClient';
import { PrismaClient } from '@prisma/client';
import { Address } from '../../types/user.types';

class UserAddressService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }
  async userFindById(userId: number) {
    return await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
  async createUserAddress(data: Address) {
    const { country, city, state, street, zipCode, addressType, userId } = data;

    return await this.prisma.address.create({
      data: {
        country,
        city,
        state,
        street,
        zipCode,
        addressType,
        userId,
      },
    });
  }
}

export const userAddressService = new UserAddressService(prisma);
