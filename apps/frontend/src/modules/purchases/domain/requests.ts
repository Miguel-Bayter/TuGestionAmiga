/**
 * Purchases Request Types
 * Input types for purchase endpoints
 */

export interface CreatePurchaseRequest {
  bookId: number
  price: number
}

export interface GetPurchasesRequest {
  userId?: number
  page?: number
  pageSize?: number
}
