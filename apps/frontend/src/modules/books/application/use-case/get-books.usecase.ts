/**
 * Get Books Use Case
 * Fetches all books with optional pagination
 */

import type { IBookRepository } from '@/domain/Repository/book.repository'
import type { Book } from '@/domain/Entity/book.entity'
import type { PaginatedResponse } from '@/shared/domain/types'

export class GetBooksUseCase {
  constructor(private bookRepository: IBookRepository) {}

  /**
   * Execute get books flow
   */
  async execute(page?: number, pageSize?: number): Promise<Book[] | PaginatedResponse<Book>> {
    return this.bookRepository.getBooks(page, pageSize)
  }
}
