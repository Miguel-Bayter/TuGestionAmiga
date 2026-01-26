/**
 * Cart Entity
 * Domain model for shopping cart
 */

export interface CartItem {
  id: number
  userId: number
  bookId: number
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Cart {
  id: number
  items: CartItem[]
  total: number
}
