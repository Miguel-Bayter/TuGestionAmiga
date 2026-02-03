import type { ICategoryRepository } from '@/modules/category/domain/interface/category.repository';

export class GetAllCategoriesUseCase {
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute() {
    return this.categoryRepository.getAll();
  }
}
