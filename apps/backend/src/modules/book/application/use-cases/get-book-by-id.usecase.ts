import type { IBookRepository } from '../../domain/book.repository';

export class GetBookByIdUseCase {
  constructor(private bookRepository: IBookRepository) {}

  async execute(id: number) {
    return this.bookRepository.getById(id);
  }
}
