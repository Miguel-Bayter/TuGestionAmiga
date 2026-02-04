/**
 * API Types
 * Domain models for Books, Cart, Loans, and API Errors
 */

/**
 * Book entity from backend
 */
export interface Book {
  id: number
  title: string
  author: string
  description?: string
  price?: number
  availability?: boolean
  stock?: number
  purchaseStock?: number
  rentalStock?: number
  categoryName?: string
  coverUrl?: string
}

/**
 * Cart item entity
 */
export interface CartItem {
  id: number
  userId: number
  bookId: number
  quantity: number
  unitPrice: number
  book?: Book
}

/**
 * Loan entity
 */
export interface Loan {
  id: number
  userId: number
  bookId: number
  loanDate: string
  dueDate: string
  returned: boolean
  book?: Book
}

/**
 * Standardized API error response
 */
export interface ApiError {
  status: number
  message: string
  code?: string
}

/**
 * Pagination metadata for list responses
 */
export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * Generic paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
