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

export interface UpdateBookRequest extends Partial<CreateBookRequest> {}

export interface GetBooksRequest {
  page?: number
  pageSize?: number
  available?: boolean
}
