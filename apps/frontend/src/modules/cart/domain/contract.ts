/**
 * Cart Repository Interface
 * Contract for shopping cart operations
 */

import type { Cart, CartItem } from './entities'

export interface ICartRepository {
  /**
   * Get user's shopping cart
   */
  getCart(): Promise<Cart>

  /**
   * Get cart items
   */
  getCartItems(): Promise<CartItem[]>

  /**
   * Add item to cart
   */
  addItem(bookId: number, quantity: number): Promise<CartItem>

  /**
   * Remove item from cart
   */
  removeItem(cartItemId: number): Promise<void>

  /**
   * Update cart item quantity
   */
  updateItem(cartItemId: number, quantity: number): Promise<CartItem>

  /**
   * Clear entire cart
   */
  clearCart(): Promise<void>

  /**
   * Checkout cart items
   */
  checkout(items: Array<{ id: number; quantity: number }>): Promise<void>
}
