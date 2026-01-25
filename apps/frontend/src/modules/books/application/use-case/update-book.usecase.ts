/**
 * Update Book Use Case
 * Updates a book (admin only)
 */

import type { IBookRepository } from '@/modules/books/domain'
import type { Book } from '@/modules/books/domain'

export class UpdateBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute update book flow
   */
  async execute(id: number, data: Partial<Book>): Promise<Book> {
    return this.bookRepository.updateBook(id, data)
  }
}
