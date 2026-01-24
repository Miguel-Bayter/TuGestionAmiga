import { GetAllBooksUseCase } from '@/modules/book/application/use-case/get-all-books.usecase';
import { GetBookByIdUseCase } from '@/modules/book/application/use-case/get-book-by-id.usecase';

export class BookService {
  constructor(
    private getAllBooksUseCase: GetAllBooksUseCase,
    private getBookByIdUseCase: GetBookByIdUseCase
  ) {}

  async getAll(available?: boolean) {
    return this.getAllBooksUseCase.execute(available);
  }

  async getById(id: number) {
    return this.getBookByIdUseCase.execute(id);
  }
}
