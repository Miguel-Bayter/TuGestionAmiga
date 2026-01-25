/**
 * Books Request Types
 * Input types for book endpoints
 */

export interface CreateBookRequest {
  title: string
  author: string
  description?: string
  categoryId?: number
  price: number
  purchaseStock: number
  rentalStock: number
}

export interface UpdateBookRequest {
  title?: string
  author?: string
  description?: string
  categoryId?: number
  price?: number
  purchaseStock?: number
  rentalStock?: number
  available?: boolean
}

export interface GetBooksRequest {
  page?: number
  pageSize?: number
  available?: boolean
}
