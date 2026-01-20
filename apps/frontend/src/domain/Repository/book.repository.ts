/**
 * Book Repository Interface
 * Contract for book operations
 */

import type { Book } from '@/domain/Entity/book.entity'
import type { PaginatedResponse } from '@/shared/types'

export interface IBookRepository {
  /**
   * Get all books with optional pagination
   */
  getBooks(page?: number, pageSize?: number): Promise<Book[] | PaginatedResponse<Book>>

  /**
   * Get a single book by ID
   */
  getBook(id: number): Promise<Book>

  /**
   * Create a new book
   */
  createBook(data: Partial<Book>): Promise<Book>

  /**
   * Update a book
   */
  updateBook(id: number, data: Partial<Book>): Promise<Book>

  /**
   * Delete a book
   */
  deleteBook(id: number): Promise<void>

  /**
   * Get available books for lending
   */
  getAvailableBooks(): Promise<Book[]>

  /**
   * Get books by category
   */
  getBooksByCategory(categoryId: number): Promise<Book[]>
}
