import type { IBookRepository } from '@/modules/book/domain/interface/book.repository';

export class GetAllBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(available?: boolean) {
    return this.bookRepository.getAll(available);
  }
}
