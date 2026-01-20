/**
 * Update Book Use Case
 * Updates a book (admin only)
 */

import type { IBookRepository } from '../../Repository'
import type { Book } from '../../Entity'

export class UpdateBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute update book flow
   */
  async execute(id: number, data: Partial<Book>): Promise<Book> {
    return this.bookRepository.updateBook(id, data)
  }
}
