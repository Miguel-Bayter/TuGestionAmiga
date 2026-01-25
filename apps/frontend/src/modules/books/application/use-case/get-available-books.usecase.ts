/**
 * Get Available Books Use Case
 * Fetches all available books for lending
 */

import type { IBookRepository } from '@/modules/books/domain'
import type { Book } from '@/modules/books/domain'

export class GetAvailableBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute get available books flow
   */
  async execute(): Promise<Book[]> {
    return this.bookRepository.getAvailableBooks()
  }
}
