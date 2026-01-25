/**
 * Books Response Types
 * Output types for book endpoints
 */

import type { Book } from './entities'

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
}
