/**
 * Create Book Use Case
 * Creates a new book (admin only)
 */

import type { IBookRepository } from '@/domain/Repository/book.repository'
import type { Book } from '@/domain/Entity/book.entity'

export class CreateBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute create book flow
   */
  async execute(data: Partial<Book>): Promise<Book> {
    return this.bookRepository.createBook(data)
  }
}
