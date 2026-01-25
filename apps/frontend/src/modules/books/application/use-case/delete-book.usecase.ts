/**
 * Delete Book Use Case
 * Deletes a book (admin only)
 */

import type { IBookRepository } from '@/domain/Repository/book.repository'

export class DeleteBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute delete book flow
   */
  async execute(id: number): Promise<void> {
    return this.bookRepository.deleteBook(id)
  }
}
