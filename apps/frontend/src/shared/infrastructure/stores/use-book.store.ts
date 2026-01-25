/**
 * Book Store
 * Manages book list state and actions using Zustand
 */

import { create } from 'zustand'
import { GetBooksUseCase, GetBookUseCase, GetAvailableBooksUseCase } from '@/domain/UseCase/book'
import { bookRepository } from '@/data/Repository/book.repository-impl'
import type { Book } from '@/domain/Entity/book.entity'
import type { PaginatedResponse } from '@/shared/domain/types'

interface BookState {
  // State
  books: Book[]
  selectedBook: Book | null
  isLoading: boolean
  error: string | null
  pagination?: PaginationInfo

  // Actions
  getBooks: (page?: number, pageSize?: number) => Promise<void>
  getBook: (id: number) => Promise<void>
  getAvailableBooks: () => Promise<void>
  clearError: () => void
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Initialize use cases
const getBooksUseCase = new GetBooksUseCase(bookRepository)
const getBookUseCase = new GetBookUseCase(bookRepository)
const getAvailableBooksUseCase = new GetAvailableBooksUseCase(bookRepository)

export const useBookStore = create<BookState>((set) => ({
  // Initial state
  books: [],
  selectedBook: null,
  isLoading: false,
  error: null,
  pagination: undefined,

  // Get books
  getBooks: async (page?: number, pageSize?: number) => {
    set({ isLoading: true, error: null })

    try {
      const result = await getBooksUseCase.execute(page, pageSize)

      if (Array.isArray(result)) {
        set({
          books: result,
          isLoading: false,
        })
      } else {
        const paginatedResult = result as PaginatedResponse<Book>
        set({
          books: paginatedResult.data,
          isLoading: false,
          pagination: paginatedResult.meta,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch books'
      set({
        isLoading: false,
        error: errorMessage,
        books: [],
      })
    }
  },

  // Get single book
  getBook: async (id: number) => {
    set({ isLoading: true, error: null })

    try {
      const book = await getBookUseCase.execute(id)
      set({
        selectedBook: book,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch book'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Get available books
  getAvailableBooks: async () => {
    set({ isLoading: true, error: null })

    try {
      const books = await getAvailableBooksUseCase.execute()
      set({
        books,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch available books'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
