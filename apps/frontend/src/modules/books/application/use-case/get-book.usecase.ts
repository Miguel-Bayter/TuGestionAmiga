/**
 * Get Book Use Case
 * Fetches a single book by ID
 */

import type { IBookRepository } from '@/modules/books/domain'
import type { Book } from '@/modules/books/domain'

export class GetBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute get book flow
   */
  async execute(id: number): Promise<Book> {
    return this.bookRepository.getBook(id)
  }
}
