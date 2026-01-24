import type { IBookRepository } from '../../domain/book.repository';

export class GetAllBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(available?: boolean) {
    return this.bookRepository.getAll(available);
  }
}
