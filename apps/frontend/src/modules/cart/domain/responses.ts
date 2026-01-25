/**
 * Cart Response Types
 * Output types for cart endpoints
 */

import type { CartItem } from './entities'

export interface GetCartResponse {
  items: CartItem[]
  total: number
  subtotal?: number
}

export interface AddToCartResponse {
  item: CartItem
  cart: CartItem[]
}

export interface RemoveFromCartResponse {
  cart: CartItem[]
}

export interface UpdateCartItemResponse {
  item: CartItem
  cart: CartItem[]
}

export interface CheckoutResponse {
  orderId: number
  message: string
}
