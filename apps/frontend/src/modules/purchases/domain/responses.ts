/**
 * Purchases Response Types
 * Output types for purchase endpoints
 */

import type { Purchase } from './entities'

export interface CreatePurchaseResponse {
  purchase: Purchase
}

export interface GetPurchasesResponse {
  purchases: Purchase[]
  total: number
  page?: number
  pageSize?: number
}
