/**
 * Create Book Use Case
 * Creates a new book (admin only)
 */

import type { IBookRepository } from '../../Repository'
import type { Book } from '../../Entity'

export class CreateBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute create book flow
   */
  async execute(data: Partial<Book>): Promise<Book> {
    return this.bookRepository.createBook(data)
  }
}
