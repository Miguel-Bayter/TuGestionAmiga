/**
 * Books Response Types
 * Output types for book endpoints
 */

import type { Book, Category } from './entities'

export interface GetBooksResponse {
  data: Book[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface GetBookResponse {
  data: Book
  category?: Category
}

export interface CreateBookResponse {
  data: Book
}

export interface UpdateBookResponse {
  data: Book
}

export interface DeleteBookResponse {
  message: string
}
