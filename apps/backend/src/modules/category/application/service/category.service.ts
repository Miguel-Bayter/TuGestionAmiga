import { GetAllCategoriesUseCase } from '@/modules/category/application/use-case/get-all-categories.usecase';

export class CategoryService {
  constructor(private getAllCategoriesUseCase: GetAllCategoriesUseCase) {}

  async getAll() {
    return this.getAllCategoriesUseCase.execute();
  }
}
