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

export interface UpdateCartItemRequest {
  cartItemId: number
  quantity: number
}

export interface CheckoutRequest {
  cartItems: Array<{
    bookId: number
    quantity: number
    type: 'purchase' | 'rental'
  }>
}

export interface GetCartRequest {
  userId?: number
}
