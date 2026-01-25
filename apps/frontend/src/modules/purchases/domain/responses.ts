/**
 * Purchases Response Types
 * Output types for purchase endpoints
 */

import type { Purchase } from './entities'

export interface CreatePurchaseResponse {
  id: number
  userId: number
  bookId: number
  price: number
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface GetPurchasesResponse {
  purchases: Purchase[]
}
