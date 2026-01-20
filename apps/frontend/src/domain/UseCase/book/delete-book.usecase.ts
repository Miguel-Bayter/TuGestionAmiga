/**
 * Delete Book Use Case
 * Deletes a book (admin only)
 */

import type { IBookRepository } from '../../Repository'

export class DeleteBookUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute delete book flow
   */
  async execute(id: number): Promise<void> {
    return this.bookRepository.deleteBook(id)
  }
}
