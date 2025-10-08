import { prisma } from '../../config/prismaClient';
import { PrismaClient } from '@prisma/client';
import { Address } from '../../types/user.types';

class UserAddressService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
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

  async isAddressTypeExist(userId: number, addressType: string) {
    return this.prisma.address.findFirst({
      where: {
        userId: userId, // There should be userId, I was using id:userId which basically wrong db call
        addressType: addressType,
      },
    });
  }
}

export const userAddressService = new UserAddressService(prisma);
