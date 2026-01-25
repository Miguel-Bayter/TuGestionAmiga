/**
 * Book State Service
 * Manages book list state without external dependencies
 */

import { GetBooksUseCase, GetBookUseCase, GetAvailableBooksUseCase } from '@/domain/UseCase/book'
import type { Book } from '@/domain/Entity/book.entity'
import type { PaginatedResponse } from '@/shared/domain/types'

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface BookStateData {
  books: Book[]
  selectedBook: Book | null
  isLoading: boolean
  error: string | null
  pagination?: PaginationInfo
}

export class BookStateService {
  private state: BookStateData = {
    books: [],
    selectedBook: null,
    isLoading: false,
    error: null,
    pagination: undefined,
  }

  private subscribers: Set<(state: BookStateData) => void> = new Set()

  constructor(
    private getBooksUseCase: GetBooksUseCase,
    private getBookUseCase: GetBookUseCase,
    private getAvailableBooksUseCase: GetAvailableBooksUseCase
  ) {}

  async getBooks(page?: number, pageSize?: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const result = await this.getBooksUseCase.execute(page, pageSize)

      if (Array.isArray(result)) {
        this.state.books = result
        this.state.isLoading = false
      } else {
        const paginatedResult = result as PaginatedResponse<Book>
        this.state.books = paginatedResult.data
        this.state.isLoading = false
        this.state.pagination = paginatedResult.meta
      }

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch books'
      this.state.isLoading = false
      this.state.error = errorMessage
      this.state.books = []

      this.notifySubscribers()
    }
  }

  async getBook(id: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const book = await this.getBookUseCase.execute(id)
      this.state.selectedBook = book
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch book'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  async getAvailableBooks(): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const books = await this.getAvailableBooksUseCase.execute()
      this.state.books = books
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch available books'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  clearError(): void {
    this.state.error = null
    this.notifySubscribers()
  }

  getState(): BookStateData {
    return { ...this.state }
  }

  subscribe(listener: (state: BookStateData) => void): () => void {
    this.subscribers.add(listener)
    listener(this.state)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((listener) => {
      listener({ ...this.state })
    })
  }
}
