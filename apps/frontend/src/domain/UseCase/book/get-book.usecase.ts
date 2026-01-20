/**
 * Get Book Use Case
 * Fetches a single book by ID
 */

import type { IBookRepository } from '@/domain/Repository/book.repository'
import type { Book } from '@/domain/Entity/book.entity'

export class GetBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute get book flow
   */
  async execute(id: number): Promise<Book> {
    return this.bookRepository.getBook(id)
  }
}
