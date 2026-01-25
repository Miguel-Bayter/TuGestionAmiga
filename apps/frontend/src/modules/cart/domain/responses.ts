/**
 * Cart Response Types
 * Output types for cart endpoints
 */

import type { CartItem } from './entities'

export interface GetCartResponse {
  data: CartItem[]
  total: number
}

export interface CheckoutResponse {
  message: string
  orderId: string
}
