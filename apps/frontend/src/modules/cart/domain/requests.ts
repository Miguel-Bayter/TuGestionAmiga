/**
 * Cart Request Types
 * Input types for cart endpoints
 */

export interface AddToCartRequest {
  bookId: number
  quantity: number
}

export interface RemoveFromCartRequest {
  cartItemId: number
}

export interface CheckoutRequest {
  items: AddToCartRequest[]
}
