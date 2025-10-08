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

  async findAddressByType(userId: number, addressType: string) {
    return this.prisma.address.findFirst({
      where: {
        userId: userId, // There should be userId, I was using id:userId which basically wrong db call
        addressType: addressType,
      },
    });
  }

  async findAddressesByUserId(userId: number) {
    return this.prisma.address.findMany({
      where: { userId: userId },
    });
  }

  async updateUserAddress(addressId: number, data: Partial<Address>) {
    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteUserAddress(addressId: number) {
    return this.prisma.address.delete({
      where: {
        id: addressId,
      },
    });
  }
}

export const userAddressService = new UserAddressService(prisma);
