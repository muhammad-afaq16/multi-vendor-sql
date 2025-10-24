import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/prismaClient';
import { Category } from '../../types/types';

class CategoryService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createCategory(category: Category) {
    const { name } = category;
    return await this.prisma.category.create({
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
  async updateCategory(category: Category) {
    const { id, name } = category;
    return await this.prisma.category.update({
      where: { id: id },
      data: {
        name,
      },
    });
  }
  async deleteCategory(id: number) {
    return await this.prisma.category.delete({
      where: { id: id },
    });
  }
  async findCategoryByName(category: Category) {
    const { name } = category;
    return await this.prisma.category.findFirst({
      where: { name: name },
    });
  }
  async findCategoryById(id: number) {
    return await this.prisma.category.findFirst({
      where: { id: id },
    });
  }
}

export const categoryService = new CategoryService(prisma);
