/**
 * Book Repository Implementation
 * Concrete implementation of book operations
 */

import { API_ENDPOINTS } from '@/shared/config'
import { bookSchema, booksArraySchema } from '@/data/Schema/book.schema'
import type { IBookRepository } from '@/domain/Repository/book.repository'
import type { Book } from '@/domain/Entity/book.entity'
import type { PaginatedResponse } from '@/shared/types'
import { axPublic, axPrivate } from '@/data/Provider'

export class BookRepository implements IBookRepository {
  /**
   * Get all books with optional pagination
   */
  async getBooks(page?: number, pageSize?: number): Promise<Book[] | PaginatedResponse<Book>> {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (pageSize !== undefined) params.append('pageSize', pageSize.toString())

    const response = await axPublic.get(API_ENDPOINTS.BOOKS, {
      params: Object.fromEntries(params),
    })

    // If response has meta, it's paginated
    if (response.data.meta) {
      return response.data as PaginatedResponse<Book>
    }

    // Otherwise, validate as array
    return booksArraySchema.parse(response.data)
  }

  /**
   * Get a single book by ID
   */
  async getBook(id: number): Promise<Book> {
    const response = await axPublic.get(API_ENDPOINTS.BOOK_BY_ID(id))

    return bookSchema.parse(response.data)
  }

  /**
   * Create a new book (admin only)
   */
  async createBook(data: Partial<Book>): Promise<Book> {
    const response = await axPrivate.post(API_ENDPOINTS.BOOKS, data)

    return bookSchema.parse(response.data)
  }

  /**
   * Update a book (admin only)
   */
  async updateBook(id: number, data: Partial<Book>): Promise<Book> {
    const response = await axPrivate.put(API_ENDPOINTS.BOOK_BY_ID(id), data)

    return bookSchema.parse(response.data)
  }

  /**
   * Delete a book (admin only)
   */
  async deleteBook(id: number): Promise<void> {
    await axPrivate.delete(API_ENDPOINTS.BOOK_BY_ID(id))
  }

  /**
   * Get available books for lending
   */
  async getAvailableBooks(): Promise<Book[]> {
    const response = await axPublic.get(API_ENDPOINTS.BOOKS, {
      params: { available: true },
    })

    return booksArraySchema.parse(response.data)
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(categoryId: number): Promise<Book[]> {
    const response = await axPublic.get(API_ENDPOINTS.BOOKS, {
      params: { categoryId },
    })
    return booksArraySchema.parse(response.data)
  }
}

/**
 * Singleton instance
 */
export const bookRepository = new BookRepository()
