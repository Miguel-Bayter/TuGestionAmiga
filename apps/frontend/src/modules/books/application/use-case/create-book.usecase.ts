/**
 * Create Book Use Case
 * Creates a new book (admin only)
 */

import type { IBookRepository } from '@/modules/books/domain'
import type { Book } from '@/modules/books/domain'

export class CreateBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute create book flow
   */
  async execute(data: Partial<Book>): Promise<Book> {
    return this.bookRepository.createBook(data)
  }
}
