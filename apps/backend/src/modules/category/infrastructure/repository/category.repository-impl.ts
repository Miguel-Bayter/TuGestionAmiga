import { PrismaClient } from '@prisma/client';
import type { ICategoryRepository } from '@/modules/category/domain/interface/category.repository';
import type { CategoryEntity } from '@/modules/category/domain/entity/category.entity';

export class CategoryRepository implements ICategoryRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CategoryEntity[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return categories;
  }
}
