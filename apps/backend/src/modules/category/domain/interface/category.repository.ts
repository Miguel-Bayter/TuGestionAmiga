import type { CategoryEntity } from '@/modules/category/domain/entity/category.entity';

export interface ICategoryRepository {
  getAll(): Promise<CategoryEntity[]>;
}
